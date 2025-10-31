import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { LoginRequest } from '../../../core/models/login-request';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormField, MatLabel ,MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
  selector: 'app-login-form',
  imports: [ 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatButtonModule, 
    MatFormField, 
    MatLabel, 
    MatError, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSnackBarModule 
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {

  // 3. Inyecta la referencia del modal (en lugar de usar el constructor)
  public dialogRef = inject(MatDialogRef<LoginForm>);
  private snackBar = inject(SnackbarService); 
  private apiConnection = inject(ApiConnectionAuth)
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({

    email:['',[Validators.required,Validators.email]],
    password:['',[Validators.required]],

  });

  onSubmint(): void{

    if(this.loginForm.valid){
      
      const login : LoginRequest = {
        email: this.loginForm.value.email || '',
        password: this.loginForm.value.password || ''
      }

      this.apiConnection.login(login).subscribe({
        next: (response) => {
          this.snackBar.openSuccessSnackBar('Login exitoso');
          this.closeDialog();
        },error: (error) => {
          this.snackBar.openErrorSnackBar('Error en el login. Revisá tus datos.');
        }

      });

    }

  }

  closeDialog(): void{
    this.dialogRef.close();
  }


}
