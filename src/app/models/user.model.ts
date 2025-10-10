export interface User {
  id: string; // UUID do Supabase
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UserPreferences {
  id: number;
  userId: string; // UUID do Supabase
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  intervalsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  createdAt: Date;
  updatedAt: Date;
}
