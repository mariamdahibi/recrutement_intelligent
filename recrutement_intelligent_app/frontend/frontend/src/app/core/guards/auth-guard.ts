import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Sécurité si Angular tourne côté serveur
  if (!isPlatformBrowser(platformId)) {
    router.navigate(['/login']);
    return false;
  }

  const userData = localStorage.getItem('user');

  // Si aucun utilisateur connecté
  if (!userData) {
    router.navigate(['/login']);
    return false;
  }

  try {

    const user = JSON.parse(userData);

    // Rôles autorisés définis dans app.routes.ts
    const allowedRoles = route.data?.['roles'] as string[] | undefined;

    // Si la route n’a pas de restriction de rôle
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Si le rôle de l'utilisateur est autorisé
    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Si l'utilisateur n'a pas le bon rôle
    if (user.role === 'USER') {
      router.navigate(['/app/profile']);
    } else {
      router.navigate(['/app/dashboard']);
    }

    return false;

  } catch (error) {

    // Si les données localStorage sont invalides
    localStorage.removeItem('user');
    router.navigate(['/login']);
    return false;

  }

};