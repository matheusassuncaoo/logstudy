export const environment = {
  production: true,
  
  // Supabase Configuration (Production)
  supabase: {
    url: process.env['SUPABASE_URL'] || 'https://seu-projeto.supabase.co',
    anonKey: process.env['SUPABASE_ANON_KEY'] || 'sua-anon-key-aqui'
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
