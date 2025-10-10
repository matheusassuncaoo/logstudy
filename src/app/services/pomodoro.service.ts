import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import {
  PomodoroSession,
  CreatePomodoroSessionDto,
  PomodoroTimer,
  PomodoroStats
} from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  // Estado do timer
  private timerSubject = new BehaviorSubject<PomodoroTimer | null>(null);
  public timer$ = this.timerSubject.asObservable();
  
  private timerSubscription?: Subscription;
  private currentSessionId?: number;

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  /**
   * Inicia uma nova sessão Pomodoro
   */
  startSession(data: CreatePomodoroSessionDto): Observable<PomodoroSession> {
    return from(this.createSession(data)).pipe(
      tap(session => {
        this.currentSessionId = session.id;
        this.initializeTimer(session);
      }),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async createSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data: session, error } = await this.supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: userId,
        routine_id: data.routineId,
        type: data.type,
        duration: data.duration,
        start_time: new Date().toISOString(),
        completed: false
      })
      .select()
      .single();

    if (error) throw error;
    if (!session) throw new Error('Erro ao criar sessão');

    return this.mapSession(session);
  }

  /**
   * Pausa a sessão atual
   */
  pauseSession(): void {
    const timer = this.timerSubject.value;
    if (timer && timer.isRunning) {
      this.timerSubscription?.unsubscribe();
      
      this.timerSubject.next({
        ...timer,
        isPaused: true,
        isRunning: false,
        pausedAt: new Date()
      });
    }
  }

  /**
   * Resume a sessão pausada
   */
  resumeSession(): void {
    const timer = this.timerSubject.value;
    if (timer && timer.isPaused) {
      this.timerSubject.next({
        ...timer,
        isPaused: false,
        isRunning: true,
        pausedAt: undefined
      });
      
      this.startTimerTick();
    }
  }

  /**
   * Para a sessão atual
   */
  stopSession(completed: boolean = false): Observable<void> {
    return from(this.endSession(completed)).pipe(
      tap(() => {
        this.timerSubscription?.unsubscribe();
        this.timerSubject.next(null);
        this.currentSessionId = undefined;
      }),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async endSession(completed: boolean): Promise<void> {
    if (!this.currentSessionId) throw new Error('Nenhuma sessão ativa');

    const timer = this.timerSubject.value;
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .from('pomodoro_sessions')
      .update({
        end_time: new Date().toISOString(),
        completed: completed
      })
      .eq('id', this.currentSessionId)
      .eq('user_id', userId);

    if (error) throw error;

    // Se completou um pomodoro, atualizar histórico
    if (completed && timer?.type === 'pomodoro') {
      await this.updateStudyHistory(userId, timer.duration);
    }
  }

  /**
   * Atualiza o histórico de estudos
   */
  private async updateStudyHistory(userId: string, duration: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Buscar registro do dia
    const { data: existing } = await this.supabase
      .from('study_history')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      // Atualizar registro existente
      await this.supabase
        .from('study_history')
        .update({
          total_time: existing.total_time + duration,
          pomodoro_sessions: existing.pomodoro_sessions + 1,
          completed_sessions: existing.completed_sessions + 1
        })
        .eq('id', existing.id);
    } else {
      // Criar novo registro
      await this.supabase
        .from('study_history')
        .insert({
          user_id: userId,
          date: today,
          total_time: duration,
          pomodoro_sessions: 1,
          completed_sessions: 1,
          short_breaks: 0,
          long_breaks: 0
        });
    }
  }

  /**
   * Inicializa o timer
   */
  private initializeTimer(session: PomodoroSession): void {
    const totalDuration = session.duration * 60; // converter para segundos
    
    const timer: PomodoroTimer = {
      sessionId: session.id,
      type: session.type,
      duration: session.duration,
      totalDuration: totalDuration,
      remainingTime: totalDuration,
      elapsedTime: 0,
      isPaused: false,
      isRunning: true,
      startedAt: new Date()
    };

    this.timerSubject.next(timer);
    this.startTimerTick();
  }

  /**
   * Inicia o tick do timer (atualiza a cada segundo)
   */
  private startTimerTick(): void {
    this.timerSubscription?.unsubscribe();
    
    this.timerSubscription = interval(1000).subscribe(() => {
      const timer = this.timerSubject.value;
      if (!timer || timer.isPaused) return;

      const newElapsedTime = timer.elapsedTime + 1;
      const newRemainingTime = timer.totalDuration - newElapsedTime;

      if (newRemainingTime <= 0) {
        // Timer completou
        this.timerSubject.next({
          ...timer,
          elapsedTime: timer.totalDuration,
          remainingTime: 0,
          isRunning: false,
          completedAt: new Date()
        });
        
        this.timerSubscription?.unsubscribe();
        this.stopSession(true).subscribe();
      } else {
        // Atualizar timer
        this.timerSubject.next({
          ...timer,
          elapsedTime: newElapsedTime,
          remainingTime: newRemainingTime
        });
      }
    });
  }

  /**
   * Obtém estatísticas do Pomodoro
   */
  getStats(): Observable<PomodoroStats> {
    return from(this.fetchStats()).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchStats(): Promise<PomodoroStats> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    // Buscar todas as sessões do usuário
    const { data: sessions, error } = await this.supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const allSessions = sessions || [];
    const completedSessions = allSessions.filter(s => s.completed);
    const pomodoroSessions = allSessions.filter(s => s.type === 'pomodoro');
    const breakSessions = allSessions.filter(s => s.type !== 'pomodoro');

    // Sessões de hoje
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = allSessions.filter(s => 
      s.start_time?.startsWith(today) && s.completed
    );

    // Calcular streak (dias consecutivos)
    const streak = await this.calculateStreak(userId);

    return {
      totalSessions: allSessions.length,
      completedSessions: completedSessions.length,
      totalPomodoroTime: pomodoroSessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + (s.duration || 0), 0),
      totalBreakTime: breakSessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + (s.duration || 0), 0),
      todaySessions: todaySessions.length,
      currentStreak: streak
    };
  }

  /**
   * Calcula streak de dias consecutivos
   */
  private async calculateStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_user_streak', { p_user_id: userId });

    if (error) {
      console.error('Erro ao calcular streak:', error);
      return 0;
    }

    return data?.[0]?.current_streak || 0;
  }

  /**
   * Obtém histórico de sessões
   */
  getSessionHistory(limit: number = 10): Observable<PomodoroSession[]> {
    return from(this.fetchSessionHistory(limit)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchSessionHistory(limit: number): Promise<PomodoroSession[]> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(this.mapSession);
  }

  /**
   * Mapeia dados do Supabase para interface PomodoroSession
   */
  private mapSession(data: any): PomodoroSession {
    return {
      id: data.id,
      userId: data.user_id,
      routineId: data.routine_id,
      type: data.type,
      duration: data.duration,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      completed: data.completed,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Retorna timer atual (síncrono)
   */
  get currentTimer(): PomodoroTimer | null {
    return this.timerSubject.value;
  }

  /**
   * Verifica se há sessão ativa
   */
  get hasActiveSession(): boolean {
    return !!this.currentSessionId;
  }
}
