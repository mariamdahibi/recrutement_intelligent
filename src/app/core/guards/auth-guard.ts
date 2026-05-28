import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard: CanActivateFn = (route) => {

  const router = inject(Router);

  const userData = localStorage.getItem('user');

  if (!userData) {
    return router.createUrlTree(['/login']);
  }

  let user: any;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem('user');
    return router.createUrlTree(['/login']);
  }

  const currentRole = user.role === 'CANDIDATE' ? 'USER' : user.role;
  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentRole)
  ) {
    return router.createUrlTree(['/app/dashboard']);
  }

  return true;
};