import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage';
import { 
  Routine, 
  CreateRoutineDto, 
  UpdateRoutineDto,
  RoutineStats 
} from '../models/index';
import { environment } from '../../environments/environment';
import { getPreset } from '../config/pomodoro-presets';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routinesSubject = new BehaviorSubject<Routine[]>([]);
  public routines$ = this.routinesSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private storage: StorageService
  ) {
    // Carregar rotinas ao iniciar se usuário estiver autenticado
    if (this.auth.isAuthenticated) {
      this.loadRoutines().subscribe();
    }

    // Escutar mudanças de autenticação
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.loadRoutines().subscribe();
      } else {
        this.routinesSubject.next([]);
      }
    });
  }

  /**
   * Carrega todas as rotinas do usuário logado
   * Force refresh: sempre busca do servidor
   */
  loadRoutines(forceRefresh: boolean = true): Observable<Routine[]> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    console.log('🔄 Carregando rotinas do servidor...');
    
    return from(this.fetchRoutines(userId)).pipe(
      tap(routines => {
        console.log(`✅ ${routines.length} rotinas carregadas`);
        this.routinesSubject.next(routines);
        // Salvar no cache offline apenas como backup
        this.storage.set('routines_cache', routines);
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar rotinas:', error);
        // Apenas em caso de erro de rede, usar cache
        if (!forceRefresh) {
          return from(this.storage.get('routines_cache')).pipe(
            map(cached => cached || []),
            tap(routines => {
              console.log('📦 Usando rotinas do cache');
              this.routinesSubject.next(routines);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private async fetchRoutines(userId: string): Promise<Routine[]> {
    const { data, error } = await this.supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapRoutine);
  }

  /**
   * Busca uma rotina específica por ID
   */
  getRoutineById(id: number): Observable<Routine> {
    return from(this.fetchRoutineById(id)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchRoutineById(id: number): Promise<Routine> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('routines')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Rotina não encontrada');

    return this.mapRoutine(data);
  }

  /**
   * Cria uma nova rotina
   */
  createRoutine(routineData: CreateRoutineDto): Observable<Routine> {
    return from(this.insertRoutine(routineData)).pipe(
      tap(routine => {
        const current = this.routinesSubject.value;
        this.routinesSubject.next([routine, ...current]);
      }),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async insertRoutine(routineData: CreateRoutineDto): Promise<Routine> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');
    // Derivar pausas automaticamente quando não informadas, usando presets 15/20/25/30
  const presetPomodoro = routineData.pomodoroTime || environment.pomodoro.workDuration;
  const derived = getPreset(presetPomodoro);

    const routineToInsert = {
      user_id: userId,
      name: routineData.name,
      subject: routineData.subject,
      color: routineData.color,
      icon: routineData.icon,
      pomodoro_time: presetPomodoro,
      short_break_time: routineData.shortBreakTime ?? derived.shortBreak,
      long_break_time: routineData.longBreakTime ?? derived.longBreak,
      intervals_before_long_break: routineData.intervalsBeforeLongBreak ?? derived.sessionsBeforeLongBreak,
      is_active: true
    };

    const { data, error } = await this.supabase
      .from('routines')
      .insert(routineToInsert)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Erro ao criar rotina');

    return this.mapRoutine(data);
  }

  /**
   * Atualiza uma rotina existente
   */
  updateRoutine(id: number, updates: UpdateRoutineDto): Observable<Routine> {
    return from(this.patchRoutine(id, updates)).pipe(
      tap(updatedRoutine => {
        const current = this.routinesSubject.value;
        const index = current.findIndex(r => r.id === id);
        if (index !== -1) {
          current[index] = updatedRoutine;
          this.routinesSubject.next([...current]);
        }
      }),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async patchRoutine(id: number, updates: UpdateRoutineDto): Promise<Routine> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.pomodoroTime !== undefined) {
      updateData.pomodoro_time = updates.pomodoroTime;
      // Se pausas não vierem informadas junto, recalcular a partir do novo pomodoro
      if (updates.shortBreakTime === undefined || updates.longBreakTime === undefined || updates.intervalsBeforeLongBreak === undefined) {
  const d = getPreset(updates.pomodoroTime);
        if (updates.shortBreakTime === undefined) updateData.short_break_time = d.shortBreak;
        if (updates.longBreakTime === undefined) updateData.long_break_time = d.longBreak;
        if (updates.intervalsBeforeLongBreak === undefined) updateData.intervals_before_long_break = d.sessionsBeforeLongBreak;
      }
    }
    if (updates.shortBreakTime !== undefined) updateData.short_break_time = updates.shortBreakTime;
    if (updates.longBreakTime !== undefined) updateData.long_break_time = updates.longBreakTime;
    if (updates.intervalsBeforeLongBreak !== undefined) updateData.intervals_before_long_break = updates.intervalsBeforeLongBreak;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await this.supabase
      .from('routines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Rotina não encontrada');

    return this.mapRoutine(data);
  }

  /**
   * Deleta uma rotina (soft delete - marca como inativa)
   */
  deleteRoutine(id: number): Observable<void> {
    return from(this.removeRoutine(id)).pipe(
      tap(() => {
        const current = this.routinesSubject.value;
        this.routinesSubject.next(current.filter(r => r.id !== id));
      }),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async removeRoutine(id: number): Promise<void> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    // Soft delete - apenas marca como inativa
    const { error } = await this.supabase
      .from('routines')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Obtém estatísticas de uma rotina específica
   */
  getRoutineStats(routineId: number): Observable<RoutineStats> {
    return from(this.fetchRoutineStats(routineId)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchRoutineStats(routineId: number): Promise<RoutineStats> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    // Usar a view routine_stats do Supabase
    const { data, error } = await this.supabase
      .from('routine_stats')
      .select('*')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) {
      // Se não houver dados na view, retornar stats vazias
      return {
        routineId,
        routineName: '',
        totalSessions: 0,
        completedSessions: 0,
        totalTime: 0
      };
    }

    return {
      routineId: data.routine_id,
      routineName: data.routine_name,
      totalSessions: data.total_sessions || 0,
      completedSessions: data.completed_sessions || 0,
      totalTime: data.total_time || 0,
      lastSession: data.last_session ? new Date(data.last_session) : undefined
    };
  }

  /**
   * Obtém todas as estatísticas de rotinas do usuário
   */
  getAllRoutinesStats(): Observable<RoutineStats[]> {
    return from(this.fetchAllRoutinesStats()).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async fetchAllRoutinesStats(): Promise<RoutineStats[]> {
    const userId = this.auth.currentUserValue?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('routine_stats')
      .select('*')
      .eq('user_id', userId)
      .order('total_sessions', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      routineId: item.routine_id,
      routineName: item.routine_name,
      totalSessions: item.total_sessions || 0,
      completedSessions: item.completed_sessions || 0,
      totalTime: item.total_time || 0,
      lastSession: item.last_session ? new Date(item.last_session) : undefined
    }));
  }

  /**
   * Mapeia dados do Supabase para interface Routine
   */
  private mapRoutine(data: any): Routine {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      subject: data.subject,
      color: data.color,
      icon: data.icon,
      pomodoroTime: data.pomodoro_time,
      shortBreakTime: data.short_break_time,
      longBreakTime: data.long_break_time,
      intervalsBeforeLongBreak: data.intervals_before_long_break,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Retorna lista atual de rotinas (síncrono)
   */
  get currentRoutines(): Routine[] {
    return this.routinesSubject.value;
  }
}
