import { Component, computed, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { ReviewItem } from '../review-item/review-item';
import { ReviewService } from '../../../core/services/review-service';
import { AddReview } from '../../review/add-review/add-review';
import { ModifyReview } from '../../review/modify-review/modify-review';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItem, AddReview, ModifyReview, MatDialogModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  private _reviewService = inject(ReviewService);
  private _authService = inject(ApiConnectionAuth);
  //Recibo las reviews y el id del libro desde BookSheet:
  reviews = input<Review[]>();
  idBook = input<number>();

  //Signal de escritura, para realizarle modificaciones
  userReview: WritableSignal<Review | undefined> = signal(undefined);

  // effect para mantener el signal con informacion
  constructor() {
    effect(() => {
      const bookId = this.idBook();
      const loggedIn = this._authService.isLoggedIn();

      if (!bookId || !loggedIn) {
        this.userReview.set(undefined);
        return;
      }

      const subscription = this._reviewService
        .getUserReviewByBookAndStatusActive(bookId)
        .subscribe({
          next: review => this.userReview.set(review),
          error: () => this.userReview.set(undefined)
        });

      return () => subscription.unsubscribe();
    });
  }

  userStatus(): boolean {
    return this._authService.isLoggedIn() ? true : false;
  }

  /*
  // Obtiene la Reseña del usuario, si es que tiene:
  private idBook$ = toObservable(this.idBook).pipe(
    filter((id): id is number => id !== undefined && id !== null), 
    switchMap(id => this._reviewService.getUserReviewByBookAndStatusActive(id))
  );
  // Se inicializa con un Observable reactivo,
  // o sea que si cambia el ID cambia la Review
  userReview = toSignal(this.idBook$, { initialValue: undefined });
  */

  filterReviews = computed(() => {
    const allReviews = this.reviews() || [];
    const idUserReview = this.userReview()?.idReview;

    if (!idUserReview) {
      return allReviews
    }

    return allReviews.filter(r => r.idReview !== idUserReview);
  })

  // Metodo para cambiar el signal 'userReview'
  actualizar(newReview: Review) {
    this.userReview.set(newReview);
  }

  eliminar(idReview: number) {
    this.userReview.set(undefined);
  }

}
