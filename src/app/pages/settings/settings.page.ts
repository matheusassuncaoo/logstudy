import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage {
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
    defaultPomodoroLength: 25,
    defaultShortBreak: 5,
    defaultLongBreak: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
    vibrationEnabled: true
  };

  constructor(private router: Router) {}

  saveSettings() {
    console.log('Settings saved:', {
      user: this.user,
      notifications: this.notifications,
      preferences: this.preferences
    });
    // TODO: Save to storage
  }

  logout() {
    // TODO: Implement logout
    this.router.navigate(['/auth']);
  }

  goBack() {
    this.router.navigate(['/tabs/perfil']);
  }
}
