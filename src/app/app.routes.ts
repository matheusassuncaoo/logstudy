import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'estudos',
        loadComponent: () => import('./pages/tabs/estudos/estudos.page').then((m) => m.EstudosPage),
      },
      {
        path: 'historico',
        loadComponent: () => import('./pages/tabs/historico/historico.page').then((m) => m.HistoricoPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/tabs/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'create-routine',
    loadComponent: () => import('./pages/create-routine/create-routine.page').then((m) => m.CreateRoutinePage),
  },
  {
    path: 'pomodoro',
    loadComponent: () => import('./pages/pomodoro/pomodoro.page').then((m) => m.PomodoroPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'dashboard',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.page').then( m => m.TermsPage)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.page').then( m => m.PrivacyPage)
  },
];
