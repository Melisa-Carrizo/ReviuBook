import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating-star',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingStar),
      multi: true
    }
  ],
  templateUrl: './rating-star.html',
  styleUrl: './rating-star.css',
})
export class RatingStar {
  maxRating = input(5); 
  stars = Array(this.maxRating()).fill(0).map((_, i) => i + 1);
  // valores del CVA:
  private _value = signal(0);
  onChange: (value: number) => void = () => {};
  onTouched: () => void = () => {};
  
  hoverRating = signal(0); // valor del hover

  value() { return this._value(); } // valor actual del control

  writeValue(value: number): void {
    if (value !== null && value !== undefined) {
      this._value.set(value);
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // esta es por si se tienen que deshabilitar las estrellas
  setDisabledState?(isDisabled: boolean): void {
    
  }

  setValue(star: number): void {
    const newValue = star;
    this._value.set(newValue);
    this.onChange(newValue); 
    this.onTouched(); 
  }

  setHoverRating(star: number): void {
    this.hoverRating.set(star);
  }
}
