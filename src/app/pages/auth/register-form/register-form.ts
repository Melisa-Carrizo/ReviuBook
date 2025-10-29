import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../core/services/auth-service';

@Component({
  selector: 'app-register-form',
  imports: [ ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
})
export class RegisterForm {

  private apiService = inject(ApiConnectionAuth);
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['',[Validators.required, Validators.email,Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      
      const registerData = {
        username: formData.username || '',
        email: formData.email || '',
        password: formData.password || ''
      };

      this.apiService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
        }
      });
    }  
  }

}
