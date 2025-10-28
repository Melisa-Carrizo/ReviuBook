import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../../core/service/apiConnection/auth-service';
import { LoginRequest } from '../../models/login-request';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormField, MatLabel ,MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login-form',
  imports: [ ReactiveFormsModule, MatDialogModule, MatButtonModule, MatButtonModule, MatFormField, MatLabel, MatError, MatInputModule, MatFormFieldModule ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {

  // 3. Inyecta la referencia del modal (en lugar de usar el constructor)
  public dialogRef = inject(MatDialogRef<LoginForm>);

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
          alert('Login exitoso');

        },error: (error) => {
          alert('Error en el login');
        }

      });

    }

  }

  closeDialog(): void{
    this.dialogRef.close();
  }


}
