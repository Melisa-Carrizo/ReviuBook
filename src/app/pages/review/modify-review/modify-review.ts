import { Component, effect, inject, input, output, signal } from '@angular/core';
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
  reviewUpdate = output<Review>();
  reviewDelete = output<Review>();
  editar = false;

  edit = this.fb.group(
    {
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    }
  );

  constructor() {
    // Se ejecuta cada vez que el input review cambia
    effect(() => {
      const currentReview = this.review();
      if (currentReview) {
        this.edit.patchValue({
          content: currentReview.content,
          rating: currentReview.rating 
        }, { emitEvent: false }); // esto es para evitar bucles
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
      idMultimedia: this.review()?.idMultimedia
    };
    this._reviewService.updateReview(update).subscribe({
      next: (data) => {
        alert("Reseña actualizada: " + data),
        this.cambiarVista(),
        this.reviewUpdate.emit(data);
      },
      error: err => console.log("Error al actualizar la review: " + err)
    })
  }

  delete() {
    if(confirm("Desea eliminar la reseña?")) {
        this._reviewService.deleteReview(this.review()!.idReview).subscribe({
          next: (data) => {
            alert("Reseña eliminada con exito"),
            this.reviewDelete.emit(data)
          },
          error: err => alert("Error al eliminar la reseña")
        })
    }
  }
  
}
