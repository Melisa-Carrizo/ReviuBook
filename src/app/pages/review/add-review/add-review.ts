import { Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { RatingStar } from '../rating-star/rating-star';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
  selector: 'app-add-review',
  imports: [ReactiveFormsModule, RatingStar],
  templateUrl: './add-review.html',
  styleUrl: './add-review.css',
})
export class AddReview {
  private _reviewService = inject(ReviewService);
  private fb = inject(NonNullableFormBuilder);
  private _sb = inject(SnackbarService);
  idBook = input<number>();
  idUser = input<number>()
  // Aca se va a guardar la review creada, que luega se va a emitir al padre
  reviewCreated = output<Review>();

  form = this.fb.group(
    {
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    }
  );

  getContent() {
    return this.form.controls.content;
  }

  getRating() {
    return this.form.controls.rating;
  }

  submitReview() {
    if (!this.form.valid) return;
    const review = {
      rating: this.getRating().value,
      content: this.getContent().value,
      idMultimedia: this.idBook()
    };
    this._reviewService.addReview(review).subscribe({
      next: (newReview) => {
        console.log("Review creada con exito");
        // le pasamos la review al padre, para que la muestre
        this.reviewCreated.emit(newReview);
      },
      error: err => {
        console.log("Error al crear la review: " + err.message); //snackbar error
        this._sb.openErrorSnackBar("Error al crear la Review")
      }
    })
  }
}
