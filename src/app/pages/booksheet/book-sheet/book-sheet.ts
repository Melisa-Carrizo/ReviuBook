import { Component, effect, inject, OnInit, signal, WritableSignal, ɵunwrapWritableSignal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { BookSheet } from '../../../core/models/BookSheet';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ReviewList } from '../review-list/review-list';
import { Review } from '../../../core/models/Review';

@Component({
  selector: 'app-book-sheet',
  imports: [ReviewList],
  templateUrl: './book-sheet.html',
  styleUrl: './book-sheet.css',
})
export class BookSheetComponent {
  private _bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  book = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this._bookService.getBookSheetById(params.get('id')!))
    ),
    {initialValue : undefined}
  );

  reviews: WritableSignal<Review[]> = signal([]);
  isFavourite: WritableSignal<boolean> = signal(false);
  idBookStage: WritableSignal<number|undefined> = signal(undefined);

  constructor() {
    effect(() => {
      const currentBook = this.book();
      if (currentBook && currentBook.reviewsDTO) {
        this.reviews.set(currentBook.reviewsDTO);
      } 
      else {
        this.reviews.set([]);
      }
    }, {allowSignalWrites: true})
  }
  
  handlerReviewDelete(idReview: number) {
    // se actualiza el signal review
    this.reviews.update(reviews => 
      reviews.filter(r => r.idReview !== idReview)
    );
  }

  handlerReviewUpdate(newReview: Review) {
    this.reviews.update(reviews => 
      reviews.map(r => r.idReview === newReview.idReview ? newReview : r)
    );
  }

}
