export interface Routine {
  id: number;
  userId: string; // UUID do Supabase
  name: string;
  subject: string;
  color: string;
  icon: string;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  intervalsBeforeLongBreak: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoutineDto {
  name: string;
  subject: string;
  color: string;
  icon: string;
  pomodoroTime?: number;
  shortBreakTime?: number;
  longBreakTime?: number;
  intervalsBeforeLongBreak?: number;
}

export interface UpdateRoutineDto {
  name?: string;
  subject?: string;
  color?: string;
  icon?: string;
  pomodoroTime?: number;
  shortBreakTime?: number;
  longBreakTime?: number;
  intervalsBeforeLongBreak?: number;
  isActive?: boolean;
}

export interface RoutineStats {
  routineId: number;
  routineName: string;
  totalSessions: number;
  completedSessions: number;
  totalTime: number;
  lastSession?: Date;
}
