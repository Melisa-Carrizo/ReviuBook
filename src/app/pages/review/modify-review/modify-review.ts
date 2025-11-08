import { Component, effect, inject, input, output, signal } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, filter, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user-service';
import { RatingStar } from '../rating-star/rating-star';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
@Component({
  selector: 'app-modify-review',
  imports: [ReactiveFormsModule, RatingStar],
  templateUrl: './modify-review.html',
  styleUrl: './modify-review.css',
})
export class ModifyReview {
  private _reviewService = inject(ReviewService);
  private fb = inject(NonNullableFormBuilder);
  private _userService = inject(UserService);
  private _auth = inject(ApiConnectionAuth);
  private _sb = inject(MatSnackBar);
  review = input<Review>();
  reviewUpdate = output<Review>();
  reviewDelete = output<number>();
  editar = false;

  private user$ = toObservable(this.review).pipe(
    map((review) => review?.idUser),
    filter((id): id is number => !!id),
    switchMap((id) => this._userService.getById(id))
  );

  user = toSignal(this.user$, { initialValue: undefined });

  edit = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  constructor() {
    // Se ejecuta cada vez que el input review cambia
    effect(() => {
      const currentReview = this.review();
      if (currentReview) {
        this.edit.patchValue(
          {
            content: currentReview.content,
            rating: currentReview.rating,
          },
          { emitEvent: false }
        ); // esto es para evitar bucles
      }
    });
  }

  getContent() {
    return this.edit.controls.content;
  }

  getRating() {
    return this.edit.controls.rating;
  }

  cambiarVista() {
    this.editar = !this.editar;
  }

  editReview() {
    if (!this.edit.valid) return;
    const update = {
      idReview: this.review()?.idReview,
      rating: this.getRating().value,
      content: this.getContent().value,
      idUser: this.review()?.idUser,
      idMultimedia: this.review()?.idMultimedia,
    };
    this._reviewService.updateReview(update).subscribe({
      next: (data) => {
        this._sb.open('¡Review actualizada!', '', {
                                duration: 1000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
        this.cambiarVista(),
        this.reviewUpdate.emit(data);
      },
      error: (err) => console.log('Error al actualizar la review: ' + err), // snackbar error
    });
  }


  delete() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar',
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        // si el rol es Admin:
        if(this._auth.isAdmin()) {
          this._reviewService.deleteReviewAdmin(this.review()!.idReview).subscribe({
            next: () => {
              this.reviewDelete.emit(this.review()!.idReview);
            },
            error: (err) => {
              console.log('Error al eliminar la Review, ' + err.message);
            },
          });
        }
        else {
          // si el rol es User:
          this._reviewService.deleteReview(this.review()!.idReview).subscribe({
            next: () => {
              this.reviewDelete.emit(this.review()!.idReview);
            },
            error: (err) => {
              console.log('Error al eliminar la Review, ' + err.message);
            },
          });
        }
        
        
      }
    });
  }

}
