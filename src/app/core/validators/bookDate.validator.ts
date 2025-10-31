import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Valida que una fecha no sea futura a hoy.
 */
export function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const inputDate = new Date(value);
    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
}