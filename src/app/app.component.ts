import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private platform: Platform) {
    console.log('AppComponent constructor called');
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit called');
    this.initializeApp();
  }

  async initializeApp() {
    console.log('Initializing app...');
    
    try {
      await this.platform.ready();
      console.log('✅ Platform is ready!');
      
      // Forçar esconder splash screen imediatamente
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
          console.log('✅ Splash screen hidden');
        } catch (e) {
          console.error('❌ Error hiding splash:', e);
        }
      }, 100);
      
      // Configurar status bar
      if (this.platform.is('capacitor')) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          console.log('✅ StatusBar configured');
        } catch (e) {
          console.error('❌ Error configuring StatusBar:', e);
        }
      }
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
    }
  }
}
