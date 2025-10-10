import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircle, arrowBack } from 'ionicons/icons';
import { RoutineService } from '../../services/routine.service';
import { Routine, CreateRoutineDto, UpdateRoutineDto } from '../../models';

@Component({
  selector: 'app-create-routine',
  templateUrl: './create-routine.page.html',
  styleUrls: ['./create-routine.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateRoutinePage implements OnInit {
  isEditMode = false;
  routineId: number | null = null;
  
  routine: CreateRoutineDto = {
    name: '',
    subject: '',
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    intervalsBeforeLongBreak: 4,
    color: 'primary',
    icon: 'book-outline'
  };

  colorOptions = [
    { name: 'Azul Claro', value: 'primary', hex: '#00D9FF' },
    { name: 'Azul', value: 'secondary', hex: '#0161E8' },
    { name: 'Roxo', value: 'tertiary', hex: '#7C3AED' },
    { name: 'Rosa', value: 'accent', hex: '#EC4899' },
    { name: 'Verde', value: 'success', hex: '#10B981' },
    { name: 'Laranja', value: 'warning', hex: '#F59E0B' }
  ];

  iconOptions = [
    'book-outline',
    'calculator-outline',
    'flask-outline',
    'code-slash-outline',
    'brush-outline',
    'language-outline',
    'basketball-outline',
    'musical-notes-outline'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private routineService: RoutineService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    addIcons({
      'checkmark-circle': checkmarkCircle,
      'arrow-back': arrowBack
    });

    // Verificar se está editando
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.routineId = parseInt(params['id']);
        this.loadRoutine(this.routineId);
      }
    });
  }

  async loadRoutine(id: number) {
    const loading = await this.loadingController.create({
      message: 'Carregando rotina...'
    });
    await loading.present();

    this.routineService.getRoutineById(id).subscribe({
      next: (routine) => {
        this.routine = {
          name: routine.name,
          subject: routine.subject,
          pomodoroTime: routine.pomodoroTime,
          shortBreakTime: routine.shortBreakTime,
          longBreakTime: routine.longBreakTime,
          intervalsBeforeLongBreak: routine.intervalsBeforeLongBreak,
          color: routine.color || 'primary',
          icon: routine.icon || 'book-outline'
        };
        loading.dismiss();
      },
      error: (error) => {
        console.error('Erro ao carregar rotina:', error);
        loading.dismiss();
        this.showToast('Erro ao carregar rotina', 'danger');
      }
    });
  }

  async saveRoutine() {
    // Validação
    if (!this.routine.name.trim()) {
      this.showToast('Por favor, digite um nome para a rotina', 'warning');
      return;
    }

    if (!this.routine.subject.trim()) {
      this.showToast('Por favor, digite uma matéria/assunto', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Atualizando rotina...' : 'Criando rotina...'
    });
    await loading.present();

    if (this.isEditMode && this.routineId) {
      // Atualizar rotina existente
      const updateDto: UpdateRoutineDto = {
        name: this.routine.name,
        subject: this.routine.subject,
        pomodoroTime: this.routine.pomodoroTime,
        shortBreakTime: this.routine.shortBreakTime,
        longBreakTime: this.routine.longBreakTime,
        intervalsBeforeLongBreak: this.routine.intervalsBeforeLongBreak,
        color: this.routine.color,
        icon: this.routine.icon
      };

      this.routineService.updateRoutine(this.routineId, updateDto).subscribe({
        next: () => {
          loading.dismiss();
          this.showToast('Rotina atualizada com sucesso!', 'success');
          this.router.navigate(['/tabs/estudos']);
        },
        error: (error) => {
          console.error('Erro ao atualizar rotina:', error);
          loading.dismiss();
          this.showToast('Erro ao atualizar rotina', 'danger');
        }
      });
    } else {
      // Criar nova rotina
      this.routineService.createRoutine(this.routine).subscribe({
        next: () => {
          loading.dismiss();
          this.showToast('Rotina criada com sucesso!', 'success');
          this.router.navigate(['/tabs/estudos']);
        },
        error: (error) => {
          console.error('Erro ao criar rotina:', error);
          loading.dismiss();
          this.showToast('Erro ao criar rotina', 'danger');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/tabs/estudos']);
  }

  async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
