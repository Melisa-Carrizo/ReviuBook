import { Component, DestroyRef, inject } from '@angular/core';
import { Book } from '../../../core/models/Book';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { noFutureDateValidator } from '../../../core/validators/bookDate.validator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isbnValidator } from '../../../core/validators/ISBN.validator';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { GENRES } from '../../../core/models/Genres';
import { Router } from '@angular/router';
import { BookService } from '../../../core/services/book-service';

@Component({
  selector: 'app-add-book-component',
  imports: [ReactiveFormsModule],
  templateUrl: './add-book-component.html',
  styleUrl: './add-book-component.css',
})
export class AddBookComponent {
  private _bookService = inject(BookService);
  private _router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private snackService = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);
  genre = GENRES;
  
  // Lista de campos que NO se deshabilitan en modo 'automatico'
  private fieldsToKeepEnabled = ['ISBN', 'category', 'author', 'description', 'inputMethod'];

  form = this.fb.group(
    {
      // CONTROL MAESTRO
      inputMethod: ['manual', [Validators.required]], 

      // CAMPOS MANUALES/AUTOMÁTICOS
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(30)]],
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(150)]],
      releaseDate: ['', [Validators.required, noFutureDateValidator]], 
      publishingHouse: ['', [Validators.required, Validators.maxLength(30)]],
      ISBN: ['', [Validators.required, isbnValidator]], 
    }
  );

  constructor() {
    // 1. Suscribirse a los cambios de 'inputMethod'
    this.form.get('inputMethod')!.valueChanges
      .pipe(
        // Usamos la inyección de DestroyRef (Opción 1)
        takeUntilDestroyed(this.destroyRef) 
        // Alternativamente, si usas standalone component: takeUntilDestroyed()
      )
      .subscribe(method => {
        this.toggleFormControls(method === 'automatico');
      });
      
    // 2. Aplicar lógica inicial
    this.toggleFormControls(this.form.get('inputMethod')!.value === 'automatico');
  }

  private toggleFormControls(isAutomatic: boolean): void {
      const allControlNames = Object.keys(this.form.controls);
      // ... (el resto de la implementación de toggleFormControls) ...
      allControlNames.forEach(name => {
          const control = this.form.get(name)!;

          if (this.fieldsToKeepEnabled.includes(name)) {
            if (control.disabled) control.enable();
          } else {
            if (isAutomatic) {
              control.disable();
              control.setValue('');
              control.clearValidators();
            } else {
              control.enable();
              if (name === 'title') control.setValidators([Validators.required, Validators.maxLength(100)]);
              if (name === 'releaseDate') control.setValidators([Validators.required, noFutureDateValidator]);
              if (name === 'publishingHouse') control.setValidators([Validators.required, Validators.maxLength(30)]);
            }
          }
      });
      this.form.updateValueAndValidity();
  }

  // Métodos auxiliares
  private handleSuccess(message: string): void {
    this.snackService.openSuccessSnackBar(message);
    this._router.navigate(['admin/libros']);
  }

  private handleError(message: string, err: any): void {
    console.error('Error:', err);
    this.snackService.openErrorSnackBar(message);
  }

  cancel(){
    this._router.navigate(['admin/libros']);
  }

  onSubmit() {
    // Si el formulario en modo manual no es válido, detenemos el proceso
    if (this.form.get('inputMethod')!.value === 'manual' && this.form.invalid) {
      this.snackService.openErrorSnackBar("Por favor, corrige los errores del formulario.");
      return;
    }
    
    // Usamos getRawValue() para obtener los valores de los controles deshabilitados
    const data = this.form.getRawValue();
    const inputMethod = data.inputMethod;

    if (inputMethod === 'manual') {
      const manualBook: Book = {
        id: 0,
        title: data.title,
        author: data.author,
        category: data.category,
        description: data.description,
        releaseDate: new Date(data.releaseDate), // Conversión segura
        publishingHouse: data.publishingHouse,
        ISBN: data.ISBN,
        status: true,
        urlImage: '',
      };

      // LLAMADA AL SERVICIO MANUAL
      this._bookService.add(manualBook).subscribe({
        next: () => this.handleSuccess("Libro creado manualmente."),
        error: (err) => this.handleError("Error al crear el libro manualmente.", err)
      });

    } else if (inputMethod === 'automatico') {
        
      // Validación básica para modo automático (solo campos visibles)
      if (this.form.get('ISBN')!.invalid || this.form.get('category')!.invalid || this.form.get('author')!.invalid) {
         this.snackService.openErrorSnackBar("ISBN, Categoría y Autor son obligatorios en modo automático.");
         return;
      }

      const autoData = {
          ISBN: data.ISBN,
          category: data.category,
          author: data.author,
          description: data.description,
      };

      // LLAMADA AL SERVICIO AUTOMÁTICO
      this._bookService.addWithGoogleApi(autoData).subscribe({
        next: () => this.handleSuccess("Libro creado automaticamente."),
        error: (err) => this.handleError("Error al crear el libro automaticamente.", err)
      });
    }
  }
}
