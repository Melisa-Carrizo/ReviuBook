import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiConnectionAuth } from '../services/auth-service';
import { SnackbarService } from '../services/snackbar-service';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiConnectionAuth);
  const router = inject(Router);
  const snackBar = inject(SnackbarService);

  if (authService.isAdmin()) {
    return true;
  } else {
    snackBar.openErrorSnackBar('Acceso denegado. Solo los administradores pueden entrar.');
    router.navigate(['home']);
    return false;
  }
};
