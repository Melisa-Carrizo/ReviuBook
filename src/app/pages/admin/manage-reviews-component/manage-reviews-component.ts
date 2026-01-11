import { Component, computed, effect, inject, signal } from '@angular/core';
import { SearchService } from '../../../core/services/search-service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { Review } from '../../../core/models/Review';
import { ReviewService } from '../../../core/services/review-service';
import { Book } from '../../../core/models/Book';
import { ReviewItem } from '../../booksheet/review-item/review-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule, ReviewItem],
  templateUrl: './manage-reviews-component.html',
  styleUrl: './manage-reviews-component.css',
})
export class ManageReviewsComponent {
  private _bookService = inject(BookService);
  private _router = inject(Router);
  books: Book[] = [];
  isLoading: boolean = true;
  hasBooks: boolean = false;

  constructor() {
    this._bookService.getAll().subscribe(
      {
        next: (data) => {
          this.books = data;
          this.isLoading = false;
          this.hasBooks = this.books && this.books.length > 0;
        },
        error: (err) => {
          console.error('Error al cargar libros:', err);
          this.isLoading = false;
        }
      }
    )
  }

  goToReviews(idBook: number) {
    this._router.navigate(['reviews-panel', idBook]);
  }

}
