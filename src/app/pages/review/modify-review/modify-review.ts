import { Component, inject, input, signal } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-modify-review',
  imports: [ReactiveFormsModule],
  templateUrl: './modify-review.html',
  styleUrl: './modify-review.css',
})
export class ModifyReview {
  private _reviewService = inject(ReviewService);
  private fb = inject(NonNullableFormBuilder);
  review = input<Review>()
  editar = false;

  edit = this.fb.group(
    {
      content: [this.review()?.content, 
        [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      rating: [this.review()?.rating, 
        [Validators.required, Validators.min(1), Validators.max(5)]]
    }
  );

  getContent() {
    return this.edit.controls.content;
  }

  getRating() {
    return this.edit.controls.rating;
  }

  cambiarVista() {
    this.editar = true;
  }

  editReview() {
    if (!this.edit.valid) return;
    const update = {
      idReview: this.review()?.idReview,
      rating: this.getRating().value,
      content: this.getContent().value,
      idUser: this.review()?.idUser,
      idMultimedia: this.review()?.idMultimedia
    };
    this._reviewService.updateReview(update).subscribe({
      next: (data) => {
        alert("Reseña actualizada: " + data)
      },
      error: err => console.log("Error al actualizar la review: " + err)
    })
  }
}
