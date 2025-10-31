import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '../../../../pages/auth/auth-modal-component/auth-modal-component';
import { ApiConnectionAuth } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [ 
    CommonModule, 
    MatButtonModule, 
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    RouterModule,

  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  readonly #dialog = inject(MatDialog);
  private authService = inject(ApiConnectionAuth);
  private router = inject(Router);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  isAdmin(){
    return this.authService.isAdmin();
  }
} 
