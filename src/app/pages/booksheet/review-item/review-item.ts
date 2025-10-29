import { Component, input } from '@angular/core';
import { Review } from '../../../core/models/Review';

@Component({
  selector: 'app-review-item',
  imports: [],
  templateUrl: './review-item.html',
  styleUrl: './review-item.css',
})
export class ReviewItem {
  review = input<Review>();

  //Agregar funcion para obtener un usuario por su ID
  

}
