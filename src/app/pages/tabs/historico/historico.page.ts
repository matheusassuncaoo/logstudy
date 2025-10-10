import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface StudySession {
  id: string;
  routineName: string;
  subject: string;
  date: Date;
  duration: number; // in minutes
  sessionsCompleted: number;
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HistoricoPage {
  sessions: StudySession[] = [
    {
      id: '1',
      routineName: 'Matemática Avançada',
      subject: 'Cálculo II',
      date: new Date(),
      duration: 75,
      sessionsCompleted: 3
    },
    {
      id: '2',
      routineName: 'Programação',
      subject: 'TypeScript',
      date: new Date(Date.now() - 86400000),
      duration: 50,
      sessionsCompleted: 2
    },
    {
      id: '3',
      routineName: 'Física Quântica',
      subject: 'Mecânica',
      date: new Date(Date.now() - 172800000),
      duration: 90,
      sessionsCompleted: 3
    }
  ];

  totalTime = 415;
  totalSessions = 16;
  weekAverage = 83;

  constructor() {}

  formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
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
