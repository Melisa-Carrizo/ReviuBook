import { Component, computed, inject, input, signal } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { ReviewItem } from '../review-item/review-item';
import { ReviewService } from '../../../core/services/review-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AddReview } from '../../review/add-review/add-review';
import { filter, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItem, AddReview],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  private _reviewService = inject(ReviewService);
  reviews = input<Review[]>();
  idBook = input<number>();
  // Obtiene la Reseña del usuario:
  private idBook$ = toObservable(this.idBook).pipe(
    filter((id): id is number => id !== undefined && id !== null), 
    switchMap(id => this._reviewService.getUserReviewByBookAndStatusActive(id))
  );
  // Se inicializa con un Observable reactiva,
  // o sea que si cambia el ID cambia la Review
  userReview = toSignal(this.idBook$, { initialValue: undefined });
  
  // Metodo para cambiar el signal 'userReview'
  actualizar(newReview: Review) {
    this.userReview = signal<Review>(newReview);
  }

}
