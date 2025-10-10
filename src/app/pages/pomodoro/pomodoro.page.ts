import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PomodoroPage implements OnInit, OnDestroy {
  Math = Math; // For use in template
  
  // Timer settings
  pomodoroLength = 25 * 60; // 25 minutes in seconds
  shortBreakLength = 5 * 60; // 5 minutes in seconds
  longBreakLength = 15 * 60; // 15 minutes in seconds
  
  // Timer state
  timeLeft = this.pomodoroLength;
  isRunning = false;
  currentMode: 'pomodoro' | 'shortBreak' | 'longBreak' = 'pomodoro';
  sessionsCompleted = 0;
  sessionsBeforeLongBreak = 4;
  
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.resetTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
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
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.onTimerComplete();
      }
    }, 1000);
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

  onTimerComplete() {
    this.pauseTimer();
    
    if (this.currentMode === 'pomodoro') {
      this.sessionsCompleted++;
      
      if (this.sessionsCompleted % this.sessionsBeforeLongBreak === 0) {
        this.currentMode = 'longBreak';
      } else {
        this.currentMode = 'shortBreak';
      }
    } else {
      this.currentMode = 'pomodoro';
    }
    
    this.resetTimer();
  }

  switchMode(mode: 'pomodoro' | 'shortBreak' | 'longBreak') {
    this.currentMode = mode;
    this.resetTimer();
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
