import { Component, inject, input } from '@angular/core';
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
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
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

  }
}
