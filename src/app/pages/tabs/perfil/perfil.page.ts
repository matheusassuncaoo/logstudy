import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../../../services/auth.service';
import { StudyHistoryService } from '../../../services/study-history.service';
import { SupabaseService } from '../../../services/supabase.service';
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
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
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

  async changeAvatar() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Alterar Foto do Perfil',
      buttons: [
        {
          text: 'Escolher da Galeria',
          icon: 'images-outline',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Tirar Foto',
          icon: 'camera-outline',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Remover Foto',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.removeAvatar();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        await this.uploadAvatar(image.dataUrl);
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      this.showToast('Erro ao selecionar foto', 'danger');
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        await this.uploadAvatar(image.dataUrl);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      this.showToast('Erro ao tirar foto', 'danger');
    }
  }

  async uploadAvatar(dataUrl: string) {
    const loading = await this.loadingController.create({
      message: 'Fazendo upload...'
    });
    await loading.present();

    try {
      // Converte data URL para blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const userId = this.user?.id;
      if (!userId) {
        throw new Error('Usuário não encontrado');
      }

      // Nome único para o arquivo
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      console.log('🔍 Debug Upload:');
      console.log('  - User ID:', userId);
      console.log('  - File Name:', fileName);
      console.log('  - File Path:', filePath);

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabaseService.client
        .storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        
        // Mensagem de erro mais amigável
        if (uploadError.message.includes('not found')) {
          throw new Error('O bucket de avatares não foi configurado no Supabase. Por favor, execute o script de configuração.');
        } else if (uploadError.message.includes('policy')) {
          throw new Error('Permissão negada. Verifique as políticas de segurança do bucket.');
        } else {
          throw new Error(uploadError.message);
        }
      }

      // Obtém a URL pública
      const { data: urlData } = this.supabaseService.client
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Erro ao gerar URL pública da imagem');
      }

      console.log('📸 URL pública gerada:', urlData.publicUrl);

      // Atualiza o perfil do usuário
      const { error: updateError } = await this.supabaseService.client
        .from('users')
        .update({ avatar: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error('Erro ao salvar avatar no perfil');
      }

      console.log('✅ Avatar salvo no banco de dados');

      // Atualiza o usuário local
      if (this.user) {
        this.user.avatar = urlData.publicUrl;
        console.log('✅ Avatar atualizado localmente:', this.user.avatar);
      }

      // Força a detecção de mudanças
      this.cdr.detectChanges();

      await loading.dismiss();
      this.showToast('Foto atualizada com sucesso! 🎉', 'success');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      await loading.dismiss();
      
      // Mostrar alerta com instruções se for erro de configuração
      if (error.message.includes('bucket') || error.message.includes('configuração')) {
        const alert = await this.alertController.create({
          header: 'Configuração Necessária',
          message: 'O Supabase Storage precisa ser configurado. Consulte o arquivo SUPABASE_STORAGE_SETUP.md na raiz do projeto para instruções detalhadas.',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        this.showToast(error.message || 'Erro ao fazer upload da foto', 'danger');
      }
    }
  }

  async removeAvatar() {
    const alert = await this.alertController.create({
      header: 'Remover Foto',
      message: 'Tem certeza que deseja remover sua foto de perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Removendo foto...'
            });
            await loading.present();

            try {
              const userId = this.user?.id;
              if (!userId) {
                throw new Error('Usuário não encontrado');
              }

              // Atualiza o perfil do usuário (remove avatar)
              const { error: updateError } = await this.supabaseService.client
                .from('users')
                .update({ avatar: null })
                .eq('id', userId);

              if (updateError) throw updateError;

              // Atualiza o usuário local
              if (this.user) {
                this.user.avatar = undefined;
              }

              await loading.dismiss();
              this.showToast('Foto removida com sucesso!', 'success');
            } catch (error: any) {
              console.error('Erro ao remover foto:', error);
              await loading.dismiss();
              this.showToast(error.message || 'Erro ao remover foto', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
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

  goToTerms() {
    this.router.navigate(['/terms']);
  }

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  goToAbout() {
    this.router.navigate(['/about']);
  }
}
