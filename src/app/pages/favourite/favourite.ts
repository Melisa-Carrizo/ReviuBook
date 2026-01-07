import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { BookStageService } from '../../core/services/book-stage';
import { Router } from '@angular/router';
import { BookStage } from '../../core/models/BookStage';
import { map } from 'rxjs';

@Component({
  selector: 'app-favourite',
  imports: [],
  templateUrl: './favourite.html',
  styleUrl: './favourite.css',
})
export class Favourite {
  private _bookStage = inject(BookStageService);
  private _router = inject(Router);

  favouriteBooks: WritableSignal<BookStage[]> = signal([]);

  // Traigo la lista de favoritos del usuario:
  constructor() {
    effect(() => {
      this._bookStage.getAll().subscribe(
        {
          next: (data) => this.favouriteBooks.set(data),
          error: e => console.error("Error al obtener la lista de favoritos: ", e.message)
        }
      );
    })
  }

  // Eliminar el libro de favoritos y actualiza el signal
  deleteFromFavourite(idBookStage: number) {
    this._bookStage.deleteBookStage(idBookStage).subscribe(
      {
        next: (data) => {
          this.favouriteBooks.update(
            b => b.filter(b => b.id !== idBookStage)
          );
        },
        error: e => console.error("Error al eliminar el libro de la lista: ", e.message)
      }
    );
  }

}
