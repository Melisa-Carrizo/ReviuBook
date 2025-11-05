import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiConnectionAuth } from '../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiConnectionAuth);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isAdmin()) {
    return true;
  } else {
    snackBar.open('Acceso denegado. Solo los administradores pueden entrar.', '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
    router.navigate(['home']);
    return false;
  }
};
