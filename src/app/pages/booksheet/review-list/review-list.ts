import { Component, input, signal } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { ReviewItem } from '../review-item/review-item';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItem],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  reviews = input<Review[]>();

}
