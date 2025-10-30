import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiConnectionAuth } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiConnectionAuth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; 
  } else {
    router.navigate(['/home']); 
    return false;
  }
};
