import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import {
  StudyHistory,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  StudyGoal,
  CreateStudyGoalDto,
  UserStreak
} from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class StudyHistoryService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  /**
   * Obtém estatísticas diárias
   */
  getDailyStats(date: Date): Observable<DailyStats> {
    return from(this.fetchDailyStats(date)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchDailyStats(date: Date): Promise<DailyStats> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const dateStr = date.toISOString().split('T')[0];

    // Buscar da view daily_user_stats
    const { data, error } = await this.supabase
      .from('daily_user_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = não encontrado

    // Buscar meta diária
    const { data: goal } = await this.supabase
      .from('study_goals')
      .select('daily_goal')
      .eq('user_id', userId)
      .single();

    const dailyGoal = goal?.daily_goal || 120; // 2 horas padrão
    const totalTime = data?.total_study_time || 0;

    return {
      date: date,
      totalTime: totalTime,
      sessions: data?.pomodoro_count || 0,
      completedSessions: data?.pomodoro_count || 0,
      goalProgress: dailyGoal > 0 ? (totalTime / dailyGoal) * 100 : 0
    };
  }

  /**
   * Obtém estatísticas semanais
   */
  getWeeklyStats(startDate: Date): Observable<WeeklyStats> {
    return from(this.fetchWeeklyStats(startDate)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchWeeklyStats(startDate: Date): Promise<WeeklyStats> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Buscar sessões da semana
    const { data: sessions, error } = await this.supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .eq('type', 'pomodoro')
      .eq('completed', true);

    if (error) throw error;

    const totalTime = (sessions || []).reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSessions = sessions?.length || 0;

    // Buscar meta semanal
    const { data: goal } = await this.supabase
      .from('study_goals')
      .select('weekly_goal')
      .eq('user_id', userId)
      .single();

    const weeklyGoal = goal?.weekly_goal || 840; // 14 horas padrão

    // Estatísticas diárias da semana
    const dailyStats: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      dailyStats.push(await this.fetchDailyStats(day));
    }

    return {
      weekStart: startDate,
      weekEnd: endDate,
      totalTime,
      sessions: totalSessions,
      completedSessions: totalSessions,
      dailyAverage: totalTime / 7,
      goalProgress: weeklyGoal > 0 ? (totalTime / weeklyGoal) * 100 : 0,
      dailyStats
    };
  }

  /**
   * Obtém estatísticas mensais
   */
  getMonthlyStats(year: number, month: number): Observable<MonthlyStats> {
    return from(this.fetchMonthlyStats(year, month)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data: sessions, error } = await this.supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .eq('type', 'pomodoro')
      .eq('completed', true);

    if (error) throw error;

    const totalTime = (sessions || []).reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSessions = sessions?.length || 0;
    const daysInMonth = endDate.getDate();

    // Buscar meta mensal
    const { data: goal } = await this.supabase
      .from('study_goals')
      .select('monthly_goal')
      .eq('user_id', userId)
      .single();

    const monthlyGoal = goal?.monthly_goal || 3600; // 60 horas padrão

    // Estatísticas semanais do mês
    const weeklyStats: WeeklyStats[] = [];
    let currentWeekStart = new Date(startDate);
    
    while (currentWeekStart <= endDate) {
      weeklyStats.push(await this.fetchWeeklyStats(currentWeekStart));
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return {
      month,
      year,
      totalTime,
      sessions: totalSessions,
      completedSessions: totalSessions,
      dailyAverage: totalTime / daysInMonth,
      goalProgress: monthlyGoal > 0 ? (totalTime / monthlyGoal) * 100 : 0,
      weeklyStats
    };
  }

  /**
   * Obtém histórico de estudo
   */
  getHistory(limit: number = 30): Observable<StudyHistory[]> {
    return from(this.fetchHistory(limit)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchHistory(limit: number): Promise<StudyHistory[]> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('study_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      date: new Date(item.date),
      totalTime: item.total_time,
      pomodoroSessions: item.pomodoro_sessions,
      completedSessions: item.completed_sessions,
      shortBreaks: item.short_breaks,
      longBreaks: item.long_breaks,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }

  /**
   * Obtém streak do usuário
   */
  getUserStreak(): Observable<UserStreak> {
    return from(this.fetchUserStreak()).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchUserStreak(): Promise<UserStreak> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .rpc('get_user_streak', { p_user_id: userId });

    if (error) throw error;

    const streakData = data?.[0] || { current_streak: 0, longest_streak: 0 };

    // Buscar última data de estudo
    const { data: lastSession } = await this.supabase
      .from('pomodoro_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .eq('type', 'pomodoro')
      .eq('completed', true)
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    return {
      currentStreak: streakData.current_streak,
      longestStreak: streakData.longest_streak,
      lastStudyDate: lastSession?.start_time ? new Date(lastSession.start_time) : new Date()
    };
  }

  /**
   * Obtém ou cria meta de estudos do usuário
   */
  getStudyGoal(): Observable<StudyGoal> {
    return from(this.fetchStudyGoal()).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchStudyGoal(): Promise<StudyGoal> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('study_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Não existe, criar padrão
      return await this.createDefaultGoal(userId);
    }

    if (error) throw error;

    return this.mapGoal(data);
  }

  private async createDefaultGoal(userId: string): Promise<StudyGoal> {
    const { data, error } = await this.supabase
      .from('study_goals')
      .insert({
        user_id: userId,
        daily_goal: 120,   // 2 horas
        weekly_goal: 840,  // 14 horas
        monthly_goal: 3600 // 60 horas
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapGoal(data);
  }

  /**
   * Cria ou atualiza meta de estudos
   */
  updateStudyGoal(goalData: CreateStudyGoalDto): Observable<StudyGoal> {
    return from(this.upsertStudyGoal(goalData)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async upsertStudyGoal(goalData: CreateStudyGoalDto): Promise<StudyGoal> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('study_goals')
      .upsert({
        user_id: userId,
        daily_goal: goalData.dailyGoal,
        weekly_goal: goalData.weeklyGoal,
        monthly_goal: goalData.monthlyGoal
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapGoal(data);
  }

  private mapGoal(data: any): StudyGoal {
    return {
      id: data.id,
      userId: data.user_id,
      dailyGoal: data.daily_goal,
      weeklyGoal: data.weekly_goal,
      monthlyGoal: data.monthly_goal,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
