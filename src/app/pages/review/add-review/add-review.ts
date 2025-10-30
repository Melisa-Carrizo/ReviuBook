import { Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../core/services/review-service';

@Component({
  selector: 'app-add-review',
  imports: [ReactiveFormsModule],
  templateUrl: './add-review.html',
  styleUrl: './add-review.css',
})
export class AddReview {
  private _reviewService = inject(ReviewService);
  private fb = inject(NonNullableFormBuilder);
  idBook = input<number>();
  idUser = input<number>()


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
      idUser: this.idUser(),
      idBook: this.idBook()
    };
    this._reviewService.addReview(review).subscribe({
      next: () => console.log("Review creada con exito"),
      error: err => console.log("Error al crear la review: " + err)
    })
  }
}
