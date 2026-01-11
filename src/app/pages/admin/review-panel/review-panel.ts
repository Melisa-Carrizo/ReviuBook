import { Component, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { UserService } from '../../../core/services/user-service';
import { ReviewAuthor } from '../review-author/review-author';

export interface ReviewWithUsername extends Review {
  username: String;
}

@Component({
  selector: 'app-review-panel',
  imports: [ReviewAuthor],
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
  reviews: WritableSignal<Review[]> = signal([]);

  constructor() {
    effect(() => {
      const currentBook = this.selectedBook;
      const bookId = String(currentBook()?.id);

      if(currentBook()) {
        this._reviewService.getAllByBookId(bookId).subscribe({
          next: (data) => {
            this.reviews.set(data)
          },
          error: err => console.error("Error al obtener las reviews: ", err.message)
        })
      }
    })
  }
  
  disableReview(idReview: number) {

    this._reviewService.deleteReviewAdmin(idReview).subscribe({
      next: () => {
        this.reviews.update(
          r => r.map(r => r.idReview === idReview ? {...r, status: !r.status} : r)
        )
      },
      error: e => console.error("Error al eliminar la reseña: ", e.message)
    })

  }


}
