import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LoginForm } from '../login-form/login-form';
import { RegisterForm } from '../register-form/register-form/register-form';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-auth-modal-component',
  imports: [ LoginForm, RegisterForm, MatDialogModule,
    MatTabsModule,   // <-- ¡AÑADIR AQUÍ!
    MatIconModule,   // <-- ¡AÑADIR AQUÍ!
    MatButtonModule, ],
  templateUrl: './auth-modal-component.html',
  styleUrl: './auth-modal-component.css',
})
export class AuthModalComponent {

  public dialogRef = inject(MatDialogRef<AuthModalComponent>);

  closeDialog(): void {
    this.dialogRef.close();
  }

  onLoginSuccess(responseData: any): void {
    this.dialogRef.close(responseData);
  }

  onRegisterSuccess(responseData: any): void {
    this.dialogRef.close(responseData);
  }
}
