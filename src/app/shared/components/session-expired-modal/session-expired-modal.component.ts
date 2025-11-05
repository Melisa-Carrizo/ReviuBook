import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '../../../pages/auth/auth-modal-component/auth-modal-component';

@Component({
  selector: 'app-session-expired-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './session-expired-modal.component.html',
  styleUrl: './session-expired-modal.component.css'
})
export class SessionExpiredModalComponent {
  private dialogRef = inject(MatDialogRef<SessionExpiredModalComponent>);
  private router = inject(Router);
  private authService = inject(ApiConnectionAuth);
  private dialog = inject(MatDialog);

  onLogin(): void {
    // Cerrar este modal primero
    this.dialogRef.close();
    
    // Esperar a que el modal se cierre completamente antes de abrir el nuevo
    setTimeout(() => {
      // Abrir el modal de autenticación con la pestaña de login
      const authDialogRef = this.dialog.open(AuthModalComponent, {
        width: '450px',
        autoFocus: false,
        panelClass: 'auth-dialog-container',
        hasBackdrop: true,
        data: { selectedTab: 0 } // 0 = Login, 1 = Register
      });
      
      // Suscribirse a cuando se cierre para manejar el login exitoso
      authDialogRef.afterClosed().subscribe((result) => {
        // Si el login fue exitoso, el resultado contendrá los datos del usuario
        if (result) {
          // El login fue exitoso, el servicio ya actualizó el estado
        }
      });
    }, 200);
  }

  onCancel(): void {
    this.dialogRef.close();
    // Limpiar sesión y redirigir a /home
    this.authService.logout({ forced: false });
    this.router.navigate(['/home']);
  }
}

