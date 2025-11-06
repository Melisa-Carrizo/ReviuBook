import { Component, computed, effect, inject, signal } from '@angular/core';
import { SearchService } from '../../../core/services/search-service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { Review } from '../../../core/models/Review';
import { ReviewService } from '../../../core/services/review-service';
import { Book } from '../../../core/models/Book';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule],
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
  books = toSignal(
    this._books.getAllActiveBooks(),
    {initialValue: undefined}
  );

   // metodo para buscar los libros
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value;
    this._search.setSearchTerm(term); // setea el termino del servicio
  }

  // libros filtrados
  filteredBooks = computed(() => {
    const allBooks = this.books();
    const term = this._search.searchTerm().toLowerCase().trim();

    if (!term) {
      return allBooks;
    }

    return allBooks?.filter(
      b => b.title.toLowerCase().trim().includes(term)
    );
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
