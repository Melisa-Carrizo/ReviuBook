import { Component, computed, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { ReviewItem } from '../review-item/review-item';
import { ReviewService } from '../../../core/services/review-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AddReview } from '../../review/add-review/add-review';
import { filter, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModifyReview } from '../../review/modify-review/modify-review';
import { ApiConnectionAuth } from '../../../core/services/auth-service';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItem, AddReview, ModifyReview],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  private _reviewService = inject(ReviewService);
  private _authService = inject(ApiConnectionAuth);
  //Recibo las reviews y el id del libro desde BookSheet:
  reviews = input<Review[]>();
  idBook = input<number>();

  // signal only-read para obtener la Review del usuario, si es que tiene
  private initialReviewLoad = toSignal(
        toObservable(this.idBook).pipe(
            filter((id): id is number => id !== undefined && id !== null), 
            switchMap(id => this._reviewService.getUserReviewByBookAndStatusActive(id))
        ), 
        { initialValue: undefined }
  );

  //Signal de escritura, para realizarle modificaciones
  userReview: WritableSignal<Review | undefined> = signal(undefined);

  // effect para mantener el signal con informacion
  constructor() {
    effect(() => {
      const loadedReview = this.initialReviewLoad();
      this.userReview.set(loadedReview);
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
