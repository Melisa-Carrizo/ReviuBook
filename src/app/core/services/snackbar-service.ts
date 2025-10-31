import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  private snackBar = inject(MatSnackBar);

  openSuccessSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, 
      verticalPosition: 'top', 
      horizontalPosition: 'center', 
      panelClass: ['success-snackbar'] 
    });
  }

  openErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, 
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar'] 
    });
  }

}
  


