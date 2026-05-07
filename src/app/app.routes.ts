// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // =========================
  // LOGIN (PUBLIC)
  // =========================
  {
  path: '',
  loadComponent: () =>
    import('./auth/login/login')
      .then(m => m.Login)
},
  // =========================
  // PROTECTED APP
  // =========================
  {
    path: 'app',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.RecruiterDashboard)
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile')
            .then(m => m.Profile)
      },

      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs')
            .then(m => m.Jobs)
      },

      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications')
            .then(m => m.Applications)
      },

      {
        path: 'recommendations',
        loadComponent: () =>
          import('./features/recommendations/recommendations')
            .then(m => m.Recommendations)
      }

    ]
  },

  // =========================
  // FALLBACK
  // =========================
  {
    path: '**',
    redirectTo: ''
  }

];