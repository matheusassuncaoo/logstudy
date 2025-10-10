import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { time, checkmarkCircle, flame, notificationsOutline, playCircle, addCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { RoutineService } from '../../../services/routine.service';
import { StudyHistoryService } from '../../../services/study-history.service';
import { Routine, DailyStats, UserStreak } from '../../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  routines: Routine[] = [];
  dailyStats: DailyStats | null = null;
  userStreak: UserStreak | null = null;
  isLoading = false;
  userName = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private routineService: RoutineService,
    private studyHistoryService: StudyHistoryService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    addIcons({
      'time': time,
      'checkmark-circle': checkmarkCircle,
      'flame': flame,
      'notifications-outline': notificationsOutline,
      'play-circle': playCircle,
      'add-circle-outline': addCircleOutline
    });

    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Usuário';
    
    this.loadData();
  }

  async loadData() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      // Carregar rotinas ativas
      this.routineService.loadRoutines().subscribe({
        next: (routines: Routine[]) => {
          this.routines = routines.filter((r: Routine) => r.isActive).slice(0, 4); // Mostrar até 4 rotinas
        },
        error: (error: any) => {
          console.error('Erro ao carregar rotinas:', error);
        }
      });

      // Carregar stats do dia
      this.studyHistoryService.getDailyStats(new Date()).subscribe({
        next: (stats: DailyStats) => {
          this.dailyStats = stats;
        },
        error: (error: any) => {
          console.error('Erro ao carregar stats diárias:', error);
        }
      });

      // Carregar streak
      this.studyHistoryService.getUserStreak().subscribe({
        next: (streak: UserStreak) => {
          this.userStreak = streak;
        },
        error: (error: any) => {
          console.error('Erro ao carregar streak:', error);
        }
      });

    } catch (error: any) {
      await this.showToast(error.message || 'Erro ao carregar dados', 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
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

  startPomodoro(routine: Routine) {
    this.router.navigate(['/pomodoro'], { 
      queryParams: { routineId: routine.id }
    });
  }

  createRoutine() {
    this.router.navigate(['/create-routine']);
  }

  goToEstudos() {
    this.router.navigate(['/tabs/estudos']);
  }

  get totalSessions(): number {
    return this.dailyStats?.sessions || 0;
  }

  get totalStudyTime(): number {
    return this.dailyStats?.totalTime || 0;
  }

  get currentStreak(): number {
    return this.userStreak?.currentStreak || 0;
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}
