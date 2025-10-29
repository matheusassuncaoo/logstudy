import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  timeOutline, 
  checkmarkCircleOutline, 
  trophyOutline, 
  statsChartOutline,
  calendarOutline,
  timerOutline
} from 'ionicons/icons';
import { StudyHistoryService } from '../../../services/study-history.service';
import { DailyStats, WeeklyStats, MonthlyStats } from '../../../models';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HistoricoPage implements OnInit {
  dailyStats: DailyStats | null = null;
  weeklyStats: WeeklyStats | null = null;
  monthlyStats: MonthlyStats | null = null;
  isLoading = false;
  
  selectedPeriod: 'day' | 'week' | 'month' = 'week';

  constructor(
    private studyHistoryService: StudyHistoryService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    addIcons({
      'time-outline': timeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'trophy-outline': trophyOutline,
      'stats-chart-outline': statsChartOutline,
      'calendar-outline': calendarOutline,
      'timer-outline': timerOutline
    });
    
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    const loading = await this.loadingController.create({
      message: 'Carregando histórico...'
    });
    await loading.present();

    this.isLoading = true;

    try {
      // Carregar estatísticas do dia
      const today = new Date();
      this.studyHistoryService.getDailyStats(today).subscribe({
        next: (stats: DailyStats) => {
          this.dailyStats = stats;
        },
        error: (error: any) => {
          console.error('Erro ao carregar stats diárias:', error);
          this.showToast('Erro ao carregar estatísticas diárias', 'danger');
        }
      });

      // Carregar estatísticas da semana
      const weekStart = this.getWeekStart(today);
      this.studyHistoryService.getWeeklyStats(weekStart).subscribe({
        next: (stats: WeeklyStats) => {
          this.weeklyStats = stats;
        },
        error: (error: any) => {
          console.error('Erro ao carregar stats semanais:', error);
          this.showToast('Erro ao carregar estatísticas semanais', 'danger');
        }
      });

      // Carregar estatísticas do mês
      this.studyHistoryService.getMonthlyStats(today.getFullYear(), today.getMonth() + 1).subscribe({
        next: (stats: MonthlyStats) => {
          this.monthlyStats = stats;
        },
        error: (error: any) => {
          console.error('Erro ao carregar stats mensais:', error);
          this.showToast('Erro ao carregar estatísticas mensais', 'danger');
        }
      });

    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  get currentStats() {
    switch (this.selectedPeriod) {
      case 'day': return this.dailyStats;
      case 'week': return this.weeklyStats;
      case 'month': return this.monthlyStats;
      default: return this.weeklyStats;
    }
  }

  get totalTime(): number {
    return this.currentStats?.totalTime || 0;
  }

  get totalSessions(): number {
    return this.currentStats?.sessions || 0;
  }

  get averageTime(): number {
    if (this.selectedPeriod === 'week') {
      return (this.weeklyStats?.dailyAverage || 0);
    } else if (this.selectedPeriod === 'month') {
      return (this.monthlyStats?.dailyAverage || 0);
    }
    return this.totalTime; // Para o dia, a média é o próprio tempo
  }

  roundProgress(value: number): number {
    return Math.round(value);
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
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
