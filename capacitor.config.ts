import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.logstudy.app',
  appName: 'LogStudy',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    // Importante: permite que o app carregue de file://
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true, // Esconder automaticamente e imediatamente
      backgroundColor: '#121212',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false, // Desabilitar fullscreen
      splashImmersive: false // Desabilitar immersive
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#00C8FF'
    }
  }
};

export default config;
