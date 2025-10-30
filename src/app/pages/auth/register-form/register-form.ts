import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginRequest } from '../../../core/models/login-request';
import { catchError, of, switchMap, tap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register-form',
  imports: [ 
    ReactiveFormsModule, 
    MatButton, 
    MatError, 
    MatFormField, 
    MatLabel, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSnackBarModule 
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',    
})
export class RegisterForm { 

  private authService = inject(ApiConnectionAuth);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar); 
  public dialogRef = inject(MatDialogRef<RegisterForm>);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['',[Validators.required, Validators.email,Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
  });

  onSubmit(): void {
  if (this.registerForm.invalid) {
    this.openErrorSnackBar("Por favor, completá el formulario correctamente.");
    return;
  }

  const registerData = {
    username: this.registerForm.value.username!,
    email: this.registerForm.value.email!,
    password: this.registerForm.value.password!
  }

  this.authService.register(registerData).pipe(
    switchMap(() => 
      this.authService.login({ email: registerData.email, password: registerData.password })
    ),
    tap(() => {
      this.openSuccessSnackBar("¡Usuario registrado e iniciado sesión con éxito!");
      this.registerForm.reset();
      this.dialogRef.close();
    }),
    catchError((error) => {
      console.error('Error en el registro o login:', error);
      this.openErrorSnackBar("Hubo un problema en el registro o inicio de sesión.");
      return of(null);
    })
  ).subscribe();
}
  
  openSuccessSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000, 
      verticalPosition: 'top', 
      horizontalPosition: 'center', 
      panelClass: ['success-snackbar'] 
    });
  }

  openErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 7000, 
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar'] 
    });
  }
}
