import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { register } from 'swiper/element/bundle';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  bookOutline,
  timeOutline,
  statsChartOutline,
  settingsOutline,
  homeOutline,
  addOutline,
  checkmarkOutline,
  closeOutline,
  playOutline,
  pauseOutline,
  stopOutline,
  refreshOutline,
  calendarOutline,
  trophyOutline,
  flameOutline,
  notificationsOutline,
  colorPaletteOutline,
  moonOutline,
  sunnyOutline,
  logOutOutline,
  chevronForwardOutline,
  chevronBackOutline,
  ellipsisVerticalOutline,
  trashOutline,
  createOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';

// Register Ionicons
addIcons({
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'book-outline': bookOutline,
  'time-outline': timeOutline,
  'stats-chart-outline': statsChartOutline,
  'settings-outline': settingsOutline,
  'home-outline': homeOutline,
  'add-outline': addOutline,
  'checkmark-outline': checkmarkOutline,
  'close-outline': closeOutline,
  'play-outline': playOutline,
  'pause-outline': pauseOutline,
  'stop-outline': stopOutline,
  'refresh-outline': refreshOutline,
  'calendar-outline': calendarOutline,
  'trophy-outline': trophyOutline,
  'flame-outline': flameOutline,
  'notifications-outline': notificationsOutline,
  'color-palette-outline': colorPaletteOutline,
  'moon-outline': moonOutline,
  'sunny-outline': sunnyOutline,
  'log-out-outline': logOutOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'chevron-back-outline': chevronBackOutline,
  'ellipsis-vertical-outline': ellipsisVerticalOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'arrow-back-outline': arrowBackOutline
});

// Register Swiper custom elements BEFORE bootstrapping
register();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__logstudy_db',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
      })
    ),
  ],
});
