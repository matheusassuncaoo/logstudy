import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { addCircleOutline, playCircle, createOutline, trashOutline, ellipsisVertical } from 'ionicons/icons';
import { RoutineService } from '../../../services/routine.service';
import { Routine } from '../../../models';

@Component({
  selector: 'app-estudos',
  templateUrl: './estudos.page.html',
  styleUrls: ['./estudos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class EstudosPage implements OnInit {
  routines: Routine[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private routineService: RoutineService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    addIcons({
      'add-circle-outline': addCircleOutline,
      'play-circle': playCircle,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'ellipsis-vertical': ellipsisVertical
    });

    this.loadRoutines();
  }

  ionViewWillEnter() {
    // Recarregar rotinas quando voltar para a página
    this.loadRoutines();
  }

  async loadRoutines() {
    this.isLoading = true;

    this.routineService.loadRoutines().subscribe({
      next: (routines: Routine[]) => {
        this.routines = routines;
        this.isLoading = false;
      },
      error: async (error: any) => {
        console.error('Erro ao carregar rotinas:', error);
        await this.showToast('Erro ao carregar rotinas', 'danger');
        this.isLoading = false;
      }
    });
  }

  createNewRoutine() {
    this.router.navigate(['/create-routine']);
  }

  async editRoutine(routine: Routine) {
    this.router.navigate(['/create-routine'], {
      queryParams: { id: routine.id }
    });
  }

  startPomodoro(routine: Routine) {
    this.router.navigate(['/pomodoro'], {
      queryParams: { routineId: routine.id }
    });
  }

  async showRoutineOptions(routine: Routine, event: Event) {
    event.stopPropagation();

    const actionSheet = await this.actionSheetController.create({
      header: routine.name,
      buttons: [
        {
          text: 'Iniciar Pomodoro',
          icon: 'play-circle',
          handler: () => {
            this.startPomodoro(routine);
          }
        },
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => {
            this.editRoutine(routine);
          }
        },
        {
          text: 'Deletar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(routine);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async confirmDelete(routine: Routine) {
    const alert = await this.alertController.create({
      header: 'Deletar Rotina',
      message: `Tem certeza que deseja deletar "${routine.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Deletar',
          role: 'destructive',
          handler: () => {
            this.deleteRoutine(routine);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteRoutine(routine: Routine) {
    const loading = await this.loadingController.create({
      message: 'Deletando...',
      spinner: 'crescent'
    });
    await loading.present();

    this.routineService.deleteRoutine(routine.id).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.showToast('Rotina deletada com sucesso!', 'success');
        this.loadRoutines();
      },
      error: async (error: any) => {
        await loading.dismiss();
        await this.showToast(error.message || 'Erro ao deletar rotina', 'danger');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
