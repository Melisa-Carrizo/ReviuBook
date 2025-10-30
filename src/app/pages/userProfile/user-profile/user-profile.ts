import { Component, inject, signal, computed } from '@angular/core';
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
import { ApiConnectionAuth } from '../../../core/services/auth-service';
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
  EditUser
   ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {

  private authService = inject(ApiConnectionAuth);
  
  // Acceso al Signal del usuario para el binding en el HTML
  currentUser = this.authService.currentUser;

  // Mostrar/ocultar formulario de edición
  showEdit = signal(false);

}
