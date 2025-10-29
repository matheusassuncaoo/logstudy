import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage';
import { GamificationState, XPProgress, DailyChallenge } from '../models';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private state$ = new BehaviorSubject<GamificationState | null>(null);

  constructor(private storage: StorageService) {}

  async load(): Promise<void> {
    const date = todayStr();
    const saved: GamificationState | null = await this.storage.get('gamification_state');
    if (!saved || saved.date !== date) {
      const fresh: GamificationState = {
        date,
        xp: saved?.xp ?? 0,
        level: this.levelForXp(saved?.xp ?? 0),
        dailyChallenges: this.createDailyChallenges(),
        streak: saved?.streak ?? 0,
        lastStudyDate: saved?.lastStudyDate,
      };
      this.state$.next(fresh);
      await this.persist();
    } else {
      this.state$.next(saved);
    }
  }

  get snapshot(): GamificationState | null {
    return this.state$.value;
  }

  async awardStudy(minutes: number): Promise<XPProgress> {
    await this.ensureLoaded();
    const st = this.snapshot!;

    // XP rule: 5 XP por minuto focado
    const gained = Math.max(0, Math.round(minutes * 5));
    const newXp = (st.xp || 0) + gained;

    // Streak local fallback
    const today = todayStr();
    if (st.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.toISOString().split('T')[0];
      if (st.lastStudyDate === y) st.streak = (st.streak || 0) + 1; else st.streak = 1;
      st.lastStudyDate = today;
    }

    // Update challenges
    for (const c of st.dailyChallenges) {
      if (c.completed) continue;
      if (c.id.startsWith('minutes_')) c.progress += minutes;
      if (c.id.startsWith('pomodoro_')) c.progress += 1; // award after each pomodoro completion
      if (c.progress >= c.target) {
        c.completed = true;
        st.xp = newXp + c.rewardXp; // bonus XP
      }
    }

    st.xp = st.xp || newXp; // ensure xp set even if no challenge was completed
    st.level = this.levelForXp(st.xp);
    this.state$.next({ ...st });
    await this.persist();
    return this.progressFromState(st);
  }

  getProgress(): XPProgress {
    const st = this.snapshot || { xp: 0, level: 1 } as any;
    return this.progressFromState(st);
  }

  getDailyChallenges(): DailyChallenge[] {
    return this.snapshot?.dailyChallenges ?? this.createDailyChallenges();
  }

  private progressFromState(st: GamificationState): XPProgress {
    const level = this.levelForXp(st.xp);
    const min = this.xpForLevel(level);
    const max = this.xpForLevel(level + 1);
    const progress = Math.min(100, Math.round(((st.xp - min) / (max - min)) * 100));
    return { xp: st.xp, level, nextLevelXp: max, progressPct: isFinite(progress) ? progress : 0 };
  }

  // Level curve: XP needed grows ~ linearly: lvl 1->2: 100xp, then +50 each level
  private xpForLevel(level: number): number {
    if (level <= 1) return 0;
    let xp = 0;
    for (let l = 1; l < level; l++) xp += 100 + (l - 1) * 50;
    return xp;
  }

  private levelForXp(xp: number): number {
    let lvl = 1;
    while (xp >= this.xpForLevel(lvl + 1)) lvl++;
    return lvl;
  }

  private createDailyChallenges(): DailyChallenge[] {
    return [
      { id: 'pomodoro_2', title: 'Complete 2 pomodoros', target: 2, progress: 0, rewardXp: 50, completed: false },
      { id: 'minutes_30', title: 'Estude 30 minutos', target: 30, progress: 0, rewardXp: 30, completed: false },
      { id: 'streak_keep', title: 'Mantenha sua sequência', target: 1, progress: 0, rewardXp: 20, completed: false },
    ];
  }

  private async persist() {
    await this.storage.set('gamification_state', this.snapshot);
  }

  private async ensureLoaded() {
    if (!this.snapshot) await this.load();
  }
}
