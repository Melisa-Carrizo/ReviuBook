import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiConnectionAuth } from '../../../core/services/auth-service'; // Asumo que esta ruta es correcta
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// ¡Importas AMBOS, el Módulo (para el array 'imports') y el Servicio (para 'inject')!
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-form',
  // Tus imports para el componente standalone se ven bien
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
  templateUrl: './register-form.html', // Asumo que esta ruta es correcta
  
  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
  styleUrl: './register-form.css',     // <-- Cambiado de .css a .scss
})
export class RegisterForm { // El nombre de tu clase es RegisterForm

  private authService = inject(ApiConnectionAuth);
  private fb = inject(FormBuilder);
  
  // Se inyecta el SERVICIO (MatSnackBar), no el MÓDULO (MatSnackBarModule)
  private snackBar = inject(MatSnackBar); 

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['',[Validators.required, Validators.email,Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Si el formulario es inválido, avisa y no continúes
      this.openErrorSnackBar("Por favor, completa el formulario correctamente.");
      return; 
    }
    
    // El formulario es válido, preparamos los datos
    const formData = this.registerForm.value;
    const registerData = {
      username: formData.username || '',
      email: formData.email || '',
      password: formData.password || ''
    };

    // --- LÓGICA DE SNACKBAR INTEGRADA ---
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // ¡AQUÍ ESTÁ LA MAGIA!
        this.openSuccessSnackBar("¡Usuario registrado con éxito!");

        // Aquí pones tu otra lógica (cerrar el modal, etc.)
        // this.registerSuccess.emit();
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        // SnackBar para el error
        this.openErrorSnackBar("Hubo un error al registrar. Intenta de nuevo.");
      }
    });
  } 

  // --- MÉTODOS "FACHEROS" PARA EL SNACKBAR ---
  // (Usan 'this.snackBar' que inyectamos arriba)

  /**
   * Abre un SnackBar de éxito (verde)
   */
  openSuccessSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000, // 5 segundos
      verticalPosition: 'top', // 'top' o 'bottom'
      horizontalPosition: 'center', // 'start', 'center', 'end'
      panelClass: ['success-snackbar'] // Clase CSS personalizada (definir en styles.scss)
    });
  }

  /**
   * Abre un SnackBar de error (rojo)
   */
  openErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 7000, // 7 segundos
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar'] // Clase CSS personalizada (definir en styles.scss)
    });
  }
}
