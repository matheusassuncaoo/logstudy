export interface StudyHistory {
  id: number;
  userId: string; // UUID do Supabase
  date: Date;
  totalTime: number;
  pomodoroSessions: number;
  completedSessions: number;
  shortBreaks: number;
  longBreaks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyGoal {
  id: number;
  userId: string; // UUID do Supabase
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudyGoalDto {
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface DailyStats {
  date: Date;
  totalTime: number;
  sessions: number;
  completedSessions: number;
  goalProgress: number;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalTime: number;
  sessions: number;
  completedSessions: number;
  dailyAverage: number;
  goalProgress: number;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalTime: number;
  sessions: number;
  completedSessions: number;
  dailyAverage: number;
  goalProgress: number;
  weeklyStats: WeeklyStats[];
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
}
