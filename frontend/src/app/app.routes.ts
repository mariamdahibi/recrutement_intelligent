import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // LOGIN
  {
    path: '',
    loadComponent: () =>
      import('./auth/login/login')
        .then(m => m.Login)
  },

  // APP
  {
    path: 'app',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      // DASHBOARD
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.RecruiterDashboard)
      },

      // PROFILE
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile')
            .then(m => m.Profile)
      },

      // JOBS
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs')
            .then(m => m.Jobs)
      },

      // APPLICATIONS
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications')
            .then(m => m.Applications)
      },

      // AI MATCHING
      {
        path: 'recommendations',
        loadComponent: () =>
          import('./features/recommendations/recommendations')
            .then(m => m.Recommendations)
      },

      // DEFAULT
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },

  // NOT FOUND
  {
    path: '**',
    redirectTo: ''
  }

];