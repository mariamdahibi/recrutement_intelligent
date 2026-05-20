import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login')
        .then(m => m.Login)
  },

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
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.RecruiterDashboard),
        data: {
          roles: ['ADMIN', 'RECRUITER', 'USER']
        }
      },

      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile')
            .then(m => m.Profile),
        data: {
          roles: ['ADMIN', 'RECRUITER', 'USER']
        }
      },

      {
        path: 'jobs',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/jobs/jobs')
            .then(m => m.Jobs),
        data: {
          roles: ['ADMIN', 'RECRUITER', 'USER']
        }
      },

      {
        path: 'applications',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/applications/applications')
            .then(m => m.Applications),
        data: {
          roles: ['ADMIN', 'RECRUITER']
        }
      },

      {
        path: 'recommendations',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recommendations/recommendations')
            .then(m => m.Recommendations),
        data: {
          roles: ['ADMIN', 'RECRUITER', 'USER']
        }
      },

      {
        path: 'admin/users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/admin/users/users')
            .then(m => m.AdminUsers),
        data: {
          roles: ['ADMIN']
        }
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];