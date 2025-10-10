import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  informationCircleOutline, 
  codeSlashOutline, 
  helpCircleOutline, 
  logOutOutline, 
  documentTextOutline, 
  chevronForward, 
  personOutline, 
  settingsOutline, 
  notificationsOutline, 
  personCircle, 
  camera,
  statsChartOutline,
  trophyOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { StudyHistoryService } from '../../../services/study-history.service';
import { User, UserStreak } from '../../../models';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PerfilPage implements OnInit {
  user: User | null = null;
  userStreak: UserStreak | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private studyHistoryService: StudyHistoryService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    addIcons({
      'information-circle-outline': informationCircleOutline,
      'code-slash-outline': codeSlashOutline,
      'help-circle-outline': helpCircleOutline,
      'log-out-outline': logOutOutline,
      'document-text-outline': documentTextOutline,
      'chevron-forward': chevronForward,
      'person-outline': personOutline,
      'settings-outline': settingsOutline,
      'notifications-outline': notificationsOutline,
      'person-circle': personCircle,
      'camera': camera,
      'stats-chart-outline': statsChartOutline,
      'trophy-outline': trophyOutline
    });

    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  loadUserData() {
    // Carregar dados do usuário
    this.user = this.authService.currentUserValue;

    // Carregar streak
    this.studyHistoryService.getUserStreak().subscribe({
      next: (streak: UserStreak) => {
        this.userStreak = streak;
      },
      error: (error: any) => {
        console.error('Erro ao carregar streak:', error);
      }
    });
  }

  get currentStreak(): number {
    return this.userStreak?.currentStreak || 0;
  }

  get longestStreak(): number {
    return this.userStreak?.longestStreak || 0;
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Sair da conta',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const loading = await this.loadingController.create({
      message: 'Saindo...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.logout().subscribe({
      next: async () => {
        await loading.dismiss();
        localStorage.removeItem('onboardingCompleted');
        this.router.navigate(['/login']);
      },
      error: async (error: any) => {
        await loading.dismiss();
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redirecionar para login
        this.router.navigate(['/login']);
      }
    });
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
