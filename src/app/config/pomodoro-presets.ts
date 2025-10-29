export type PomodoroPreset = {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  sessionsBeforeLongBreak: number;
};

// Fixed presets requested: 15, 20, 25, 30
export const POMODORO_PRESETS: Record<number, PomodoroPreset> = {
  15: { pomodoro: 15, shortBreak: 3, longBreak: 9, sessionsBeforeLongBreak: 4 },
  20: { pomodoro: 20, shortBreak: 4, longBreak: 12, sessionsBeforeLongBreak: 4 },
  25: { pomodoro: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 },
  30: { pomodoro: 30, shortBreak: 6, longBreak: 18, sessionsBeforeLongBreak: 4 }
};

export const ALLOWED_POMODOROS = Object.keys(POMODORO_PRESETS).map(n => +n);

export function snapToAllowedPomodoro(minutes: number): number {
  // Snap to closest in [15,20,25,30]
  let closest = ALLOWED_POMODOROS[0];
  let best = Math.abs(minutes - closest);
  for (const m of ALLOWED_POMODOROS) {
    const d = Math.abs(minutes - m);
    if (d < best) { closest = m; best = d; }
  }
  return closest;
}

export function getPreset(minutes: number): PomodoroPreset {
  const snapped = snapToAllowedPomodoro(minutes);
  return POMODORO_PRESETS[snapped];
}
