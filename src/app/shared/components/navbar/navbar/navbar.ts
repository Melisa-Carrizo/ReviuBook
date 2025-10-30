import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '../../../../pages/auth/auth-modal-component/auth-modal-component';
import { ApiConnectionAuth } from '../../../../core/services/auth-service';
import { Observable } from 'rxjs';
import { User } from '../../../../core/models/User';
import { CommonModule } from '@angular/common'; // Para @if y | async
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; // <--- 1. IMPORTANTE: Añadir MatMenu
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [ 
    CommonModule, 
    MatButtonModule, 
    MatToolbarModule,
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  readonly #dialog = inject(MatDialog);
  private authService = inject(ApiConnectionAuth);
  currentUser = this.authService.currentUser;

  openAuthModal(): void {
    const dialogRef = this.#dialog.open(AuthModalComponent, {
      width: '450px',
      autoFocus: false,
      panelClass: 'auth-dialog-container'
    });
  }

  openLoginModal(): void {
    
    const dialogRef = this.#dialog.open(AuthModalComponent, {
      width: '450px',
      autoFocus: false, 
      panelClass: 'auth-dialog-container' 
    });
  }

}
