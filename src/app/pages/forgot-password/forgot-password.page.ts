import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBack } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    addIcons({
      'mail-outline': mailOutline,
      'arrow-back': arrowBack
    });
  }

  async sendResetEmail() {
    if (!this.email) {
      this.showToast('Por favor, insira seu email', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando email...'
    });
    await loading.present();

    this.authService.resetPassword(this.email).subscribe({
      next: async () => {
        await loading.dismiss();
        this.showToast('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        this.router.navigate(['/login']);
      },
      error: async (error: any) => {
        await loading.dismiss();
        console.error('Erro ao enviar email:', error);
        this.showToast('Erro ao enviar email. Verifique o endereço e tente novamente.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
