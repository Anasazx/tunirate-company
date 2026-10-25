import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/authService/auth.service';

// Only lets signed-in company members into the app; everyone else goes to login
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isCompanyMember()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

// Keeps signed-in users away from the login/register pages
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isCompanyMember()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
