import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../../core/services/book-service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { noFutureDateValidator } from '../../../core/validators/bookDate.validator';
import { GENRES } from '../../../core/models/Genres';
import { Book } from '../../../core/models/Book';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
  selector: 'app-edit-book-component',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-book-component.html',
  styleUrl: './edit-book-component.css',
})
export class EditBookComponent {
  private _bookService = inject(BookService);
  private _routerActivated = inject(ActivatedRoute);
  private _router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private snackService = inject(SnackbarService);
  book = toSignal(this._bookService.getBookById(this._routerActivated.snapshot.paramMap.get('id')!));
  genre = GENRES;

  form = this.fb.group(
    {
      title: [this.book()?.title ?? '',[Validators.required,Validators.maxLength(100)]],
      author:[this.book()?.author ?? '',[Validators.required, Validators.maxLength(30)]],
      category:[this.book()?.category ?? '',[Validators.required]],
      description:[this.book()?.description ?? '',[Validators.required, Validators.maxLength(150)]],
      realeaseDate:[this.book()?.releaseDate ?? '',[Validators.required, noFutureDateValidator]],
      publishingHouse:[this.book()?.publishingHouse ?? '',[Validators.required,Validators.maxLength(30)]],
      status: [this.book()?.status,[Validators.required]]
    }
  );

  constructor() {
    effect(() => {
      const b = this.book();
      if (b) {
        this.form.patchValue({
          title: b.title,
          author: b.author,
          category: b.category,
          description: b.description,
          realeaseDate: this.formatDate(b.releaseDate),
          publishingHouse: b.publishingHouse,
          status: b.status
        });
      }
    });
  }

  private formatDate(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; 
  }

  cancel(){
    this._router.navigate(['admin/libros']);
  }

  onSubmit() {
    const data = this.form.value;
    console.log(data.publishingHouse)
    const releaseDateValue: Date = new Date(data.realeaseDate!);

    const book: Book = {
      id: this.book()!.id,
      category: data.category!,
      description: data.description!,
      releaseDate: releaseDateValue,
      status: data.status !== undefined && data.status !== null 
            ? data.status
            : this.book()!.status,       
      urlImage: this.book()!.urlImage,
      ISBN: this.book()!.ISBN,
      title: data.title!,
      author: data.author!,
      publishingHouse: data.publishingHouse!
    };

    this._bookService.update(book).subscribe({
      next: () => {
        this.snackService.openSuccessSnackBar("¡Libro actualizado!");
        this._router.navigate(['admin/libros']);
      },
      error: (err) => {
        this.snackService.openErrorSnackBar("Ocurrió un error al actualizar")
        this._router.navigate(['admin/libros']); 
      }
    });
  }
}
