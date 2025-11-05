import { Injectable, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredModalComponent } from '../../shared/components/session-expired-modal/session-expired-modal.component';
import { ApiConnectionAuth } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class SessionExpiredService {
  private dialog = inject(MatDialog);
  private authService = inject(ApiConnectionAuth);
  private sessionExpired$ = new Subject<void>();
  private isModalOpen = false;
  private subscription?: Subscription;

  constructor() {
    // Suscribirse a los eventos de sesión expirada
    this.subscription = this.sessionExpired$.subscribe(() => {
      if (!this.isModalOpen) {
        this.showSessionExpiredModal();
      }
    });
  }

  notifySessionExpired(): void {
    // Notificar que la sesión expiró
    // Solo mostrar el modal si no hay otro modal abierto
    if (!this.isModalOpen) {
      this.sessionExpired$.next();
    }
  }

  private showSessionExpiredModal(): void {
    if (this.isModalOpen) {
      return; // Ya hay un modal abierto
    }
    
    this.isModalOpen = true;
    // Actualizar el signal del authService para reflejar que no hay sesión
  this.authService.logout({ forced: true });
    
    // Usar setTimeout para asegurar que se ejecute en el siguiente ciclo
    setTimeout(() => {
      const dialogRef = this.dialog.open(SessionExpiredModalComponent, {
        width: '400px',
        disableClose: true,
        panelClass: 'session-expired-dialog-container',
        hasBackdrop: true
      });

      dialogRef.afterClosed().subscribe(() => {
        this.isModalOpen = false;
      });
    }, 0);
  }
}

