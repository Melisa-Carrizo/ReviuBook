import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { LoginRequest } from '../../../core/models/login-request';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormField, MatLabel ,MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
  selector: 'app-login-form',
  imports: [ 
    ReactiveFormsModule, 
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

  @Output() loginSuccess = new EventEmitter<any>();
  
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
          // Emitir el evento de éxito al componente padre (AuthModalComponent)
          this.loginSuccess.emit(response);
        },error: (error) => {
          this.snackBar.openErrorSnackBar('Error en el login. Revisá tus datos.');
        }

      });

    }

  }

}
