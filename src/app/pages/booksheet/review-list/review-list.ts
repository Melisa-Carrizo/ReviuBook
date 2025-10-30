import { Component, inject, input, signal } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { ReviewItem } from '../review-item/review-item';
import { ReviewService } from '../../../core/services/review-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItem],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  private _reviewService = inject(ReviewService);
  idBook = input<number>();
  reviews = input<Review[]>();
  userReview = toSignal(
    this._reviewService.getUserReviewByBookAndStatusActive(this.idBook()!.toString()),
    {initialValue : undefined}
  );
}
