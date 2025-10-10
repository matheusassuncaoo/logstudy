import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { logInOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    addIcons({
      'log-in-outline': logInOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

    // Verificar se já está logado
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/tabs/home']);
    }
  }

  async onLogin() {
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    this.authService.login({
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        
        await this.showToast('Login realizado com sucesso!', 'success');
        this.router.navigate(['/tabs/home']);
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        
        const errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
        await this.showToast(errorMessage, 'danger');
      }
    });
  }

  validateForm(): boolean {
    if (!this.email || !this.password) {
      this.showToast('Preencha todos os campos', 'warning');
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

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    // TODO: Implementar recuperação de senha
    this.showToast('Funcionalidade em desenvolvimento', 'warning');
  }

  goBack() {
    this.router.navigate(['/welcome']);
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
