import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '../../models';
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
  user: User | null = null;
  editedName: string = '';

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
    private toastController: ToastController,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    // Carregar usuário autenticado
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.editedName = user?.name || '';
    });
    
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

  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome',
          value: this.user?.name || '',
          attributes: {
            maxlength: 100
          }
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.user?.email || '',
          attributes: {
            maxlength: 255
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            const name = data.name?.trim();
            const email = data.email?.trim();
            
            // Validação
            if (!name || name.length < 2) {
              this.showToast('❌ Nome deve ter pelo menos 2 caracteres', 'danger');
              return false;
            }
            
            if (!email || !this.isValidEmail(email)) {
              this.showToast('❌ Email inválido', 'danger');
              return false;
            }
            
            // Verificar se houve mudanças
            const nameChanged = name !== this.user?.name;
            const emailChanged = email !== this.user?.email;
            
            if (!nameChanged && !emailChanged) {
              this.showToast('ℹ️ Nenhuma alteração detectada', 'warning');
              return true;
            }
            
            await this.updateProfile(name, email, emailChanged);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  private async updateProfile(name: string, email: string, emailChanged: boolean) {
    if (!this.user?.id) {
      await this.showToast('❌ Usuário não autenticado', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: emailChanged ? 'Atualizando perfil e email...' : 'Atualizando perfil...'
    });
    await loading.present();

    try {
      // Se o email mudou, atualizar no Supabase Auth primeiro
      if (emailChanged) {
        const { error: authError } = await this.supabaseService.auth.updateUser({
          email: email
        });

        if (authError) {
          throw new Error(`Erro ao atualizar email: ${authError.message}`);
        }
      }

      // Atualizar na tabela users
      const updateData: any = {
        name: name,
        updated_at: new Date().toISOString()
      };

      if (emailChanged) {
        updateData.email = email;
      }

      const { error: dbError } = await this.supabaseService
        .from('users')
        .update(updateData)
        .eq('id', this.user.id);

      if (dbError) throw dbError;

      // Atualizar localmente
      if (this.user) {
        this.user.name = name;
        this.user.email = email;
        this.user.updatedAt = new Date();
        localStorage.setItem('currentUser', JSON.stringify(this.user));
      }

      const message = emailChanged 
        ? '✅ Perfil atualizado! Verifique seu novo email para confirmar a alteração.'
        : '✅ Perfil atualizado com sucesso!';
      
      await this.showToast(message, 'success');
      
      if (emailChanged) {
        // Opcional: fazer logout após mudança de email
        setTimeout(() => {
          this.showEmailChangeInfo();
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      await this.showToast(
        error.message || '❌ Erro ao atualizar perfil',
        'danger'
      );
    } finally {
      await loading.dismiss();
    }
  }

  private async showEmailChangeInfo() {
    const alert = await this.alertController.create({
      header: 'Email Alterado',
      message: 'Seu email foi atualizado. Por favor, verifique sua nova caixa de entrada para confirmar a alteração. Você pode precisar fazer login novamente.',
      buttons: [
        {
          text: 'Continuar',
          role: 'cancel'
        },
        {
          text: 'Fazer Logout',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
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
