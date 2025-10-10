// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // Supabase Configuration
  supabase: {
    url: 'https://rhzijueznhpfqfgsfqxu.supabase.co', // Substitua pela sua URL do Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemlqdWV6bmhwZnFmZ3NmcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE0NDMsImV4cCI6MjA3NTY5NzQ0M30.MKm1PzIMf22FD31f_EvXWx1lr7v2uw-pR533c8DkeA0' // Substitua pela sua anon key do Supabase
  },
  
  // Storage Configuration
  storage: {
    name: 'logstudy_storage',
    driverOrder: ['indexeddb', 'localstorage']
  },
  
  // Pomodoro Defaults
  pomodoro: {
    workDuration: 25, // minutes
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  },
  
  // Feature Flags
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: false, // Disabled in dev
    enableCloudSync: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

