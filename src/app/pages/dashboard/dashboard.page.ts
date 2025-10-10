import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface Routine {
  id: string;
  name: string;
  subject: string;
  color: string;
  pomodoroLength: number;
  sessionsCompleted: number;
  totalTime: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage {
  routines: Routine[] = [
    {
      id: '1',
      name: 'Matemática Avançada',
      subject: 'Cálculo II',
      color: 'primary',
      pomodoroLength: 25,
      sessionsCompleted: 8,
      totalTime: 200
    },
    {
      id: '2',
      name: 'Programação',
      subject: 'TypeScript',
      color: 'secondary',
      pomodoroLength: 25,
      sessionsCompleted: 5,
      totalTime: 125
    },
    {
      id: '3',
      name: 'Física Quântica',
      subject: 'Mecânica',
      color: 'tertiary',
      pomodoroLength: 30,
      sessionsCompleted: 3,
      totalTime: 90
    }
  ];

  totalSessions = 16;
  totalStudyTime = 415; // in minutes
  currentStreak = 5; // days

  constructor(private router: Router) {}

  createNewRoutine() {
    this.router.navigate(['/create-routine']);
  }

  startPomodoro(routine: Routine) {
    // TODO: Pass routine data to pomodoro page
    this.router.navigate(['/pomodoro']);
  }

  editRoutine(routine: Routine) {
    // TODO: Navigate to edit page
    console.log('Edit routine:', routine);
  }

  deleteRoutine(routine: Routine) {
    // TODO: Implement delete confirmation
    this.routines = this.routines.filter(r => r.id !== routine.id);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}
