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
  person,
  personCircle,
  personCircleOutline,
  mailOutline, 
  lockClosedOutline, 
  keyOutline,
  eyeOutline, 
  eyeOffOutline,
  bookOutline,
  timeOutline,
  timerOutline,
  statsChartOutline,
  settingsOutline,
  homeOutline,
  home,
  addOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  checkmarkCircle,
  closeOutline,
  close,
  playOutline,
  pauseOutline,
  stopOutline,
  refreshOutline,
  calendarOutline,
  alarmOutline,
  cafeOutline,
  trophyOutline,
  flameOutline,
  flame,
  notificationsOutline,
  colorPaletteOutline,
  moonOutline,
  sunnyOutline,
  logOutOutline,
  logInOutline,
  chevronForwardOutline,
  chevronForward,
  chevronBackOutline,
  ellipsisVerticalOutline,
  trashOutline,
  createOutline,
  arrowBackOutline,
  barChart,
  barChartOutline,
  documentTextOutline,
  informationCircleOutline,
  codeSlashOutline,
  imagesOutline,
  phonePortraitOutline,
  shieldCheckmarkOutline,
  volumeMediumOutline,
  camera,
  cameraOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';

// Register Ionicons
addIcons({
  'person-outline': personOutline,
  'person': person,
  'person-circle': personCircle,
  'person-circle-outline': personCircleOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'key-outline': keyOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'book-outline': bookOutline,
  'time-outline': timeOutline,
  'timer-outline': timerOutline,
  'stats-chart-outline': statsChartOutline,
  'settings-outline': settingsOutline,
  'home-outline': homeOutline,
  'home': home,
  'add-outline': addOutline,
  'checkmark-outline': checkmarkOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'checkmark-circle': checkmarkCircle,
  'close-outline': closeOutline,
  'close': close,
  'play-outline': playOutline,
  'pause-outline': pauseOutline,
  'stop-outline': stopOutline,
  'refresh-outline': refreshOutline,
  'calendar-outline': calendarOutline,
  'alarm-outline': alarmOutline,
  'cafe-outline': cafeOutline,
  'trophy-outline': trophyOutline,
  'flame-outline': flameOutline,
  'flame': flame,
  'notifications-outline': notificationsOutline,
  'color-palette-outline': colorPaletteOutline,
  'moon-outline': moonOutline,
  'sunny-outline': sunnyOutline,
  'log-out-outline': logOutOutline,
  'log-in-outline': logInOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'chevron-forward': chevronForward,
  'chevron-back-outline': chevronBackOutline,
  'ellipsis-vertical-outline': ellipsisVerticalOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'arrow-back-outline': arrowBackOutline,
  'bar-chart': barChart,
  'bar-chart-outline': barChartOutline,
  'document-text-outline': documentTextOutline,
  'information-circle-outline': informationCircleOutline,
  'code-slash-outline': codeSlashOutline,
  'images-outline': imagesOutline,
  'phone-portrait-outline': phonePortraitOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'volume-medium-outline': volumeMediumOutline,
  'camera': camera,
  'camera-outline': cameraOutline
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
