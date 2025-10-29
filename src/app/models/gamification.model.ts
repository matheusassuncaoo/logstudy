export interface XPProgress {
  xp: number;           // total XP acumulado
  level: number;        // nível atual
  nextLevelXp: number;  // XP necessário para próximo nível
  progressPct: number;  // 0-100 progresso no nível atual
}

export interface DailyChallenge {
  id: string;             // ex: "pomodoro_2", "minutes_30"
  title: string;          // ex: "Complete 2 pomodoros"
  target: number;         // alvo numérico (pomodoros ou minutos)
  progress: number;       // progresso atual
  rewardXp: number;       // XP ao concluir
  completed: boolean;     // status do dia
}

export interface GamificationState {
  date: string;                 // YYYY-MM-DD
  xp: number;
  level: number;
  dailyChallenges: DailyChallenge[];
  streak: number;               // fallback local de streak
  lastStudyDate?: string;       // YYYY-MM-DD
}

export interface LevelInfo {
  level: number;
  minXp: number;
  maxXp: number;
}
