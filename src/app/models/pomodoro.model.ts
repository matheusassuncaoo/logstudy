export interface PomodoroSession {
  id: number;
  userId: string; // UUID do Supabase
  routineId: number;
  type: 'pomodoro' | 'short_break' | 'long_break';
  duration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePomodoroSessionDto {
  routineId: number;
  type: 'pomodoro' | 'short_break' | 'long_break';
  duration: number;
}

export interface UpdatePomodoroSessionDto {
  endTime?: Date;
  completed?: boolean;
  actualDuration?: number;
  pausedTime?: number;
  interrupted?: boolean;
}

export interface PomodoroTimer {
  sessionId: number;
  type: 'pomodoro' | 'short_break' | 'long_break';
  duration: number;
  remainingTime: number;
  elapsedTime: number;
  totalDuration: number;
  isRunning: boolean;
  isPaused: boolean;
  pausedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  currentSession: PomodoroSession | null;
  remainingTime: number;
  currentInterval: number;
  totalIntervals: number;
}

export interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalPomodoroTime: number;
  totalBreakTime: number;
  todaySessions: number;
  currentStreak: number;
}
