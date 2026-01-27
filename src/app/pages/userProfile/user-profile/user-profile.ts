import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario en standalone

// --- IMPORTS DE ANGULAR MATERIAL ---
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { Router } from '@angular/router';
import { SessionExpiredService } from '../../../core/services/session-expired-service';
import { EditUser } from '../edit-user/edit-user/edit-user';

// --- Otros servicios (ej. AuthService) ---
// ... otros imports de modelos o servicios ..

@Component({
  selector: 'app-user-profile',
  imports: [ 
    CommonModule,
    // Angular Material Modules
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
  MatButtonModule,
  RouterModule,
  EditUser
   ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {

  private authService = inject(ApiConnectionAuth);
  private router = inject(Router);
  private sessionExpiredService = inject(SessionExpiredService);
  private hasPrompted = false;
  
  // Acceso al Signal del usuario para el binding en el HTML
  currentUser = this.authService.currentUser;

  // Mostrar/ocultar formulario de edición
  showEdit = signal(false);

  constructor() {
    this.authService.syncSessionFromStorage();
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (!loggedIn && !this.hasPrompted) {
        this.hasPrompted = true;
        this.sessionExpiredService.notifySessionExpired();
        this.router.navigate(['/home']);
      }
    });
  }

  toggleEdit(): void {
    this.showEdit.update((current) => !current);
  }

}
