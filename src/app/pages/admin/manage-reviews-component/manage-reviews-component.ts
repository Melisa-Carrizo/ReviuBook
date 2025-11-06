import { Component, computed, effect, inject, signal } from '@angular/core';
import { SearchService } from '../../../core/services/search-service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { Review } from '../../../core/models/Review';
import { ReviewService } from '../../../core/services/review-service';
import { Book } from '../../../core/models/Book';
import { ReviewItem } from '../../booksheet/review-item/review-item';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule, ReviewItem],
  templateUrl: './manage-reviews-component.html',
  styleUrl: './manage-reviews-component.css',
})
export class ManageReviewsComponent {
  private _search = inject(SearchService);
  private _books = inject(BookService);
  private _reviews = inject(ReviewService);
  selectedBook = signal<Book | undefined>(undefined);
  selectedBookReviews = signal<Review[] | undefined>(undefined); 
  currentSearchTerm: string = '';
  searchResultBooks = signal<Book[] | undefined>(undefined);
  /*
  books = toSignal(
    this._books.getAllActiveBooks(),
    {initialValue: undefined}
  );
  */

   // metodo para buscar los libros
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentSearchTerm = input.value;
    //this._search.setSearchTerm(term); // setea el termino del servicio
  }

  // se llama cuando el usuario presiona entre
  onSearchSubmit() {
    const term = this.currentSearchTerm.toLowerCase().trim();
    this.selectedBook.set(undefined); 

    if (!term) {
        // Si el término está vacío, puedes resetear la lista de resultados
        this.searchResultBooks.set([]);
        return;
    }
    // busco los libros que coincidan con el titulo ingresado
    this._books.getBookByTitle(term).subscribe({
        next: (books) => {
            this.searchResultBooks.set(books); // los guardo para luego elegir uno
        },
        error: (err) => {
            console.error('Error al buscar libros:', err);
            this.searchResultBooks.set([]); // si hay error la lista queda vacia
        }
    });
  }

  // libros filtrados
  filteredBooks = computed(() => {
    return this.searchResultBooks();
  })

  // obtiene las reviews del libro seleccionado
  constructor() {
    // cambia c/ vez que se selectedBooks se setea
    effect(() => {
      const book = this.selectedBook();
      if (book) {
        this.selectedBookReviews.set(undefined); 

        this._reviews.getAllByBookId(book.id.toString()).subscribe({
            next: (reviews) => {
                this.selectedBookReviews.set(reviews);
            },
            error: (err) => {
                console.error('Error al cargar reseñas:', err);
                this.selectedBookReviews.set([]);
            }
        });
      } else {
          this.selectedBookReviews.set(undefined);
      }
    });
  }
  
  reviews = computed(() => {
    return this.selectedBookReviews();
  })

  // seteo el libro del que quiero ver las reviews
  onBookSelect(book: Book) {
      this.selectedBook.set(book);
  }

}
