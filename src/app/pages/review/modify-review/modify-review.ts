import { Component, inject, input } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';

@Component({
  selector: 'app-modify-review',
  imports: [],
  templateUrl: './modify-review.html',
  styleUrl: './modify-review.css',
})
export class ModifyReview {
  private _reviewService = inject(ReviewService);
  review = input<Review>()
}
