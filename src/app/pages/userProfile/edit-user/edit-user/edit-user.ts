import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user-service';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ApiConnectionAuth } from '../../../../core/services/auth-service';
import { signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-edit-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {

  private userService = inject(UserService);
  private authService = inject(ApiConnectionAuth);
  currentUser = this.authService.currentUser;

  private fb = inject(FormBuilder);

  @Output() cancel = new EventEmitter<void>();

  // Señal interna que representa el evento de cancelación y puede usarse reactivamente en el componente
  cancelSignal: WritableSignal<boolean> = signal(false);

  userForm = this.fb.group({
        username: [this.currentUser()?.username || '', [Validators.required, Validators.minLength(2)]],
        email: [this.currentUser()?.email || '', [Validators.required, Validators.email, Validators.maxLength(30)]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), passwordPolicyValidator]],
        // Se añaden los Validators de longitud a confirmPassword
        confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), passwordPolicyValidator]],
    }, { validators: passwordsMatchValidator });

  onCancel(): void {
    this.cancel.emit();
  }


  onSubmit(): void {
    if (this.userForm.valid) {
      const updatedUser = {
        username: this.userForm.value.username!,
        email: this.userForm.value.email!,
        password: this.userForm.value.password!,
        role: this.currentUser()!.role
      };
      this.userService.updateUserProfile(updatedUser).subscribe({
        next: (user) => {
          console.log('Perfil actualizado:', user);
          this.authService.refreshCurrentUser();
          this.cancel.emit();
        }
      });
    }
        


}


}
/** Validador personalizado para comparar password y confirmPassword en un FormGroup */
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // Si no tenemos ambos controles o si aún no tienen valores, no hacemos la validación de coincidencia.
    if (!password || !confirmPassword || (password.value === null && confirmPassword.value === null)) {
        return null;
    }

    // El error de mismatch solo debe aparecer si AMBOS son válidos individualmente (ej. no requeridos, etc.)
    // y si no coinciden. Usaremos el estado 'dirty' o 'touched' en el template para mostrar el mensaje
    return password.value === confirmPassword.value ? null : { passwordsMismatch: true };
}

/** Validador de política de contraseña: al menos 1 mayúscula y 1 número */
export function passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null | undefined;
  if (!value) return null; // deja que 'required' maneje vacío

  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);

  return hasUppercase && hasNumber ? null : { passwordPolicy: true };
}