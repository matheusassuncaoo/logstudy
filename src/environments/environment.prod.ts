export const environment = {
  production: true,
  
  // Supabase Configuration (Production)
  supabase: {
    url: 'https://rhzijueznhpfqfgsfqxu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemlqdWV6bmhwZnFmZ3NmcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE0NDMsImV4cCI6MjA3NTY5NzQ0M30.MKm1PzIMf22FD31f_EvXWx1lr7v2uw-pR533c8DkeA0'
  },
  
  // Storage Configuration
  storage: {
    name: 'logstudy_storage',
    driverOrder: ['indexeddb', 'localstorage']
  },
  
  // Pomodoro Defaults
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  },
  
  // Feature Flags
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: true, // Enabled in production
    enableCloudSync: true
  }
};
