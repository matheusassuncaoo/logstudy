import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { personAddOutline, mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  termsAccepted: boolean = false;
  privacyAccepted: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    addIcons({
      'person-add-outline': personAddOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'person-outline': personOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

    // Verificar se voltou da página de termos/privacidade com aceite
    const termsAcceptedStorage = localStorage.getItem('termsAccepted');
    const privacyAcceptedStorage = localStorage.getItem('privacyAccepted');
    
    if (termsAcceptedStorage === 'true') {
      this.termsAccepted = true;
    }
    if (privacyAcceptedStorage === 'true') {
      this.privacyAccepted = true;
    }
  }

  async onRegister() {
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando sua conta...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      termsAccepted: this.termsAccepted,
      privacyAccepted: this.privacyAccepted
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        
        // Limpar flags de aceite
        localStorage.removeItem('termsAccepted');
        localStorage.removeItem('privacyAccepted');
        
        // Mostrar popup de confirmação de email
        await this.showEmailConfirmationAlert();
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        
        // Se for erro de email não confirmado, mostrar alert
        if (error.message && error.message.includes('email')) {
          await this.showEmailConfirmationAlert();
        } else {
          const errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
          await this.showToast(errorMessage, 'danger');
        }
      }
    });
  }

  validateForm(): boolean {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.showToast('Preencha todos os campos', 'warning');
      return false;
    }

    if (this.name.length < 3) {
      this.showToast('Nome deve ter no mínimo 3 caracteres', 'warning');
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.showToast('Email inválido', 'warning');
      return false;
    }

    if (this.password.length < 6) {
      this.showToast('A senha deve ter no mínimo 6 caracteres', 'warning');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('As senhas não conferem', 'warning');
      return false;
    }

    if (!this.termsAccepted || !this.privacyAccepted) {
      this.showToast('Você deve aceitar os Termos de Uso e Política de Privacidade', 'warning');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToTerms(event: Event) {
    event.preventDefault();
    this.router.navigate(['/terms'], { queryParams: { from: 'register' } });
  }

  goToPrivacy(event: Event) {
    event.preventDefault();
    this.router.navigate(['/privacy'], { queryParams: { from: 'register' } });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/welcome']);
  }

  async showEmailConfirmationAlert() {
    const alert = await this.alertController.create({
      header: 'Confirme seu Email!',
      subHeader: '📧',
      message: `Enviamos um link de confirmação para:\n\n${this.email}\n\nVerifique sua caixa de entrada e clique no link para ativar sua conta.`,
      buttons: [
        {
          text: 'Entendi',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ],
      backdropDismiss: false,
      cssClass: 'email-confirmation-alert'
    });
    
    await alert.present();
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
