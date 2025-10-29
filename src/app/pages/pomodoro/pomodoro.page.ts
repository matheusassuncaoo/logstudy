import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PomodoroService } from '../../services/pomodoro.service';
import { RoutineService } from '../../services/routine.service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PomodoroPage implements OnInit, OnDestroy {
  Math = Math; // For use in template
  
  // Timer settings (em segundos) - serão carregados das preferências
  pomodoroLength = environment.pomodoro.workDuration * 60;
  shortBreakLength = environment.pomodoro.shortBreakDuration * 60;
  longBreakLength = environment.pomodoro.longBreakDuration * 60;
  
  // Timer state
  timeLeft = this.pomodoroLength;
  isRunning = false;
  currentMode: 'pomodoro' | 'shortBreak' | 'longBreak' = 'pomodoro';
  sessionsCompleted = 0;
  sessionsBeforeLongBreak = environment.pomodoro.sessionsUntilLongBreak;
  
  private timerInterval: any;
  private timerSubscription?: Subscription;
  private currentSessionId?: number;
  private routineId?: number; // ID da rotina vinculada

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pomodoroService: PomodoroService,
    private routineService: RoutineService,
    private authService: AuthService,
    private storage: StorageService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    // Carregar preferências salvas
    await this.loadPreferences();
    
    // Capturar routineId dos query params
    this.route.queryParams.subscribe(params => {
      if (params['routineId']) {
        this.routineId = parseInt(params['routineId'], 10);
        console.log('🎯 Pomodoro vinculado à rotina:', this.routineId);
        // Carregar tempos a partir da rotina
        this.routineService.getRoutineById(this.routineId).subscribe({
          next: (routine) => {
            if (routine?.pomodoroTime) {
              this.pomodoroLength = routine.pomodoroTime * 60;
            }
            if (routine?.shortBreakTime) {
              this.shortBreakLength = routine.shortBreakTime * 60;
            }
            if (routine?.longBreakTime) {
              this.longBreakLength = routine.longBreakTime * 60;
            }
            if (routine?.intervalsBeforeLongBreak) {
              this.sessionsBeforeLongBreak = routine.intervalsBeforeLongBreak;
            }
            if (!this.isRunning) {
              this.resetTimer();
            }
          },
          error: (err) => console.warn('Não foi possível carregar a rotina, usando preferências:', err)
        });
      }
    });
    
    this.resetTimer();
    await this.requestNotificationPermissions();
  }

  async loadPreferences() {
    try {
      const preferences = await this.storage.get('user_preferences');
      if (preferences) {
        this.pomodoroLength = preferences.defaultPomodoroLength * 60;
        this.shortBreakLength = preferences.defaultShortBreak * 60;
        this.longBreakLength = preferences.defaultLongBreak * 60;
        this.sessionsBeforeLongBreak = preferences.sessionsBeforeLongBreak || 4;
        
        console.log('⚙️ Preferências carregadas:', {
          pomodoro: preferences.defaultPomodoroLength,
          shortBreak: preferences.defaultShortBreak,
          longBreak: preferences.defaultLongBreak
        });
        
        // Atualizar timeLeft se estiver no estado inicial
        if (!this.isRunning) {
          this.resetTimer();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar preferências:', error);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    this.timerSubscription?.unsubscribe();
  }

  async requestNotificationPermissions() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Permissão de notificação negada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
    }
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    
    // Criar sessão no banco de dados
    if (this.currentMode === 'pomodoro') {
      this.createPomodoroSession();
    }
    
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.onTimerComplete();
      }
    }, 1000);
  }

  async createPomodoroSession() {
    try {
      const user = this.authService.currentUserValue;
      if (!user) return;

      this.pomodoroService.startSession({
        routineId: this.routineId, // Usar o routineId capturado
        type: 'pomodoro',
        // PomodoroService espera duração em MINUTOS.
        duration: Math.round(this.pomodoroLength / 60)
      }).subscribe({
        next: (session) => {
          this.currentSessionId = session.id;
          console.log('✅ Sessão Pomodoro criada:', session.id);
          if (this.routineId) {
            console.log('🎯 Vinculada à rotina:', this.routineId);
          }
        },
        error: (error) => {
          console.error('❌ Erro ao criar sessão:', error);
        }
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  stopTimer() {
    this.pauseTimer();
    this.resetTimer();
  }

  resetTimer() {
    this.pauseTimer();
    switch (this.currentMode) {
      case 'pomodoro':
        this.timeLeft = this.pomodoroLength;
        break;
      case 'shortBreak':
        this.timeLeft = this.shortBreakLength;
        break;
      case 'longBreak':
        this.timeLeft = this.longBreakLength;
        break;
    }
  }

  async onTimerComplete() {
    this.pauseTimer();
    
    // Completar sessão no banco de dados
    if (this.currentMode === 'pomodoro' && this.currentSessionId) {
      await this.completePomodoroSession();
    }
    
    // Enviar notificação
    await this.sendNotification();
    
    // Tocar som (opcional - pode adicionar depois)
    // await this.playSound();
    
    if (this.currentMode === 'pomodoro') {
      this.sessionsCompleted++;
      
      if (this.sessionsCompleted % this.sessionsBeforeLongBreak === 0) {
        this.currentMode = 'longBreak';
        await this.showAlert('Parabéns! 🎉', 'Você completou 4 sessões! Hora de uma pausa longa.');
      } else {
        this.currentMode = 'shortBreak';
        await this.showAlert('Ótimo trabalho! 💪', 'Sessão concluída! Hora de uma pausa curta.');
      }
    } else {
      this.currentMode = 'pomodoro';
      await this.showAlert('Pausa terminada! ⏰', 'Pronto para mais uma sessão de foco?');
    }
    
    this.resetTimer();
  }

  async completePomodoroSession() {
    try {
      if (!this.currentSessionId) return;
      
      this.pomodoroService.stopSession(true).subscribe({
        next: () => {
          console.log('✅ Sessão completada:', this.currentSessionId);
          this.showToast('Sessão Pomodoro completada! 🎉');
          this.currentSessionId = undefined;
        },
        error: (error: any) => {
          console.error('❌ Erro ao completar sessão:', error);
        }
      });
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
    }
  }

  async sendNotification() {
    try {
      const title = this.currentMode === 'pomodoro' 
        ? '🎉 Sessão Completada!' 
        : '⏰ Pausa Terminada!';
      
      const body = this.currentMode === 'pomodoro'
        ? 'Parabéns! Você completou uma sessão de foco. Hora de descansar!'
        : 'Sua pausa terminou. Pronto para mais uma sessão?';

      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }]
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: [
        {
          text: 'OK',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  switchMode(mode: 'pomodoro' | 'shortBreak' | 'longBreak') {
    this.currentMode = mode;
    this.resetTimer();
  }

  async skipSession() {
    const alert = await this.alertController.create({
      header: 'Pular Sessão?',
      message: 'Você realmente deseja pular esta sessão? O progresso não será salvo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Pular',
          handler: () => {
            this.pauseTimer();
            
            // Se for pomodoro com sessão ativa, cancelar sem completar
            if (this.currentMode === 'pomodoro' && this.currentSessionId) {
              this.pomodoroService.stopSession(false).subscribe({
                next: () => {
                  console.log('⏭️ Sessão pulada (não completada)');
                  this.currentSessionId = undefined;
                },
                error: (error: any) => {
                  console.error('❌ Erro ao pular sessão:', error);
                }
              });
            }
            
            // NÃO incrementar sessionsCompleted ao pular
            // Apenas avançar para próximo modo
            if (this.currentMode === 'pomodoro') {
              this.currentMode = 'shortBreak';
              console.log('⏭️ Pulou Pomodoro → Indo para Pausa Curta');
            } else {
              this.currentMode = 'pomodoro';
              console.log('⏭️ Pulou Pausa → Indo para Pomodoro');
            }
            
            this.resetTimer();
            this.showToast('⏭️ Sessão pulada (não contabilizada)');
          }
        }
      ]
    });

    await alert.present();
  }

  getCurrentModeLength(): number {
    switch (this.currentMode) {
      case 'pomodoro':
        return this.pomodoroLength;
      case 'shortBreak':
        return this.shortBreakLength;
      case 'longBreak':
        return this.longBreakLength;
    }
  }

  get displayTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get progress(): number {
    let total: number;
    switch (this.currentMode) {
      case 'pomodoro':
        total = this.pomodoroLength;
        break;
      case 'shortBreak':
        total = this.shortBreakLength;
        break;
      case 'longBreak':
        total = this.longBreakLength;
        break;
    }
    return (total - this.timeLeft) / total;
  }

  get modeTitle(): string {
    switch (this.currentMode) {
      case 'pomodoro':
        return 'Tempo de Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
    }
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }
}
