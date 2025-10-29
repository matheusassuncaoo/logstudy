import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage';
import { environment } from '../../../environments/environment';
import { ALLOWED_POMODOROS, getPreset, snapToAllowedPomodoro } from '../../config/pomodoro-presets';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  user = {
    name: 'Usuário',
    email: 'usuario@email.com',
    avatar: ''
  };

  notifications = {
    pomodoroEnd: true,
    breakEnd: true,
    dailyReminder: true,
    weeklyReport: false
  };

  preferences = {
    defaultPomodoroLength: environment.pomodoro.workDuration,
    defaultShortBreak: environment.pomodoro.shortBreakDuration,
    defaultLongBreak: environment.pomodoro.longBreakDuration,
    sessionsBeforeLongBreak: environment.pomodoro.sessionsUntilLongBreak,
    soundEnabled: true,
    vibrationEnabled: true
  };

  constructor(
    private router: Router,
    private storage: StorageService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadSettings();
  }

  private clampToAllowedDurations(value: number): number {
    const allowed = [15, 20, 25, 30];
    return allowed.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
  }

  onPomodoroLengthChanged() {
    // Garanta apenas valores 15/20/25/30 e recalcule pausas automaticamente (20% curta, 60% longa)
    const clamped = this.clampToAllowedDurations(this.preferences.defaultPomodoroLength);
    this.preferences.defaultPomodoroLength = clamped;
    const shortBreak = Math.max(1, Math.round(clamped * 0.2));
    const longBreak = Math.max(shortBreak + 1, Math.round(clamped * 0.6));
    this.preferences.defaultShortBreak = shortBreak;
    this.preferences.defaultLongBreak = longBreak;
  }

  async loadSettings() {
    try {
      // Carregar preferências salvas
      const savedPreferences = await this.storage.get('user_preferences');
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...savedPreferences };
      }

      // Carregar configurações de notificação
      const savedNotifications = await this.storage.get('notification_settings');
      if (savedNotifications) {
        this.notifications = { ...this.notifications, ...savedNotifications };
      }

      console.log('⚙️ Settings carregadas:', {
        preferences: this.preferences,
        notifications: this.notifications
      });
    } catch (error) {
      console.error('❌ Erro ao carregar settings:', error);
    }
  }

  async saveSettings() {
    try {
      // Enforce fixed presets (15,20,25,30) and derive pauses automatically
      const snapped = snapToAllowedPomodoro(this.preferences.defaultPomodoroLength);
      const preset = getPreset(snapped);
      this.preferences.defaultPomodoroLength = preset.pomodoro;
      this.preferences.defaultShortBreak = preset.shortBreak;
      this.preferences.defaultLongBreak = preset.longBreak;
      this.preferences.sessionsBeforeLongBreak = preset.sessionsBeforeLongBreak;

      // Salvar preferências
      await this.storage.set('user_preferences', this.preferences);
      
      // Salvar notificações
      await this.storage.set('notification_settings', this.notifications);

      console.log('✅ Settings salvas:', {
        preferences: this.preferences,
        notifications: this.notifications
      });

      // Mostrar toast de confirmação
      const toast = await this.toastController.create({
        message: '✅ Configurações salvas com sucesso!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('❌ Erro ao salvar settings:', error);
      
      const toast = await this.toastController.create({
        message: '❌ Erro ao salvar configurações',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  editProfile() {
    console.log('🔧 Editar perfil');
    this.router.navigate(['/tabs/perfil']);
  }

  changePassword() {
    console.log('🔑 Alterar senha');
    this.router.navigate(['/forgot-password']);
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  navigateToTerms() {
    this.router.navigate(['/terms']);
  }

  navigateToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  logout() {
    // TODO: Implement logout
    this.router.navigate(['/auth']);
  }

  goBack() {
    this.router.navigate(['/tabs/perfil']);
  }
}
