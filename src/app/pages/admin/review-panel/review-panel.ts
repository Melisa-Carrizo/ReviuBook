import { Component, inject, input, signal, WritableSignal } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { Book } from '../../../core/models/Book';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-review-panel',
  imports: [],
  templateUrl: './review-panel.html',
  styleUrl: './review-panel.css',
})
export class ReviewPanel {
  private _reviewService = inject(ReviewService);
  private _bookService = inject(BookService);
  private _route = inject(ActivatedRoute);
  selectedBook = toSignal(
    this._route.paramMap.pipe(
      switchMap(params => this._bookService.getBookById(params.get('id')!))
    ),
    {initialValue : undefined}
  );
  reviews: WritableSignal<Review[] | undefined> = signal([]);
  

  constructor() {
    const bookId = String(this.selectedBook()?.id)
    this._reviewService.getAllByBookId(bookId).subscribe({
      next: (data) => {
        this.reviews.set(data)
      },
      error: err => console.error("No se pudieron obtener las reseñas del libro: ", err.message)
    });
  }
}
