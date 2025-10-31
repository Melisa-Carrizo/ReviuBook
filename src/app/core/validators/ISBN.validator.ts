import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Valida que el campo ISBN tenga 10 o 13 dígitos (puede terminar en X si es de 10).
 */
export function isbnValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const regex = /^(\d{9}[0-9X])|(978\d{9}[0-9])$/;

    return regex.test(value) ? null : { invalidIsbn: true };
}