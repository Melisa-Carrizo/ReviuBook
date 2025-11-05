import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiConnectionAuth } from '../services/auth-service';
import { SessionExpiredService } from '../services/session-expired-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiConnectionAuth);
  const router = inject(Router);
  const sessionExpiredService = inject(SessionExpiredService);
  const storedToken = localStorage.getItem('authToken');

  authService.syncSessionFromStorage();

  if (authService.isLoggedIn()) {
    return true; 
  } else {
    if (authService.wasForcedLogout() || storedToken) {
      sessionExpiredService.notifySessionExpired();
    }
    router.navigate(['/home']); 
    return false;
  }
};
