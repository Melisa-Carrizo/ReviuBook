import { Component, inject, input } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { UserService } from '../../../core/services/user-service';

@Component({
  selector: 'app-review-item',
  imports: [],
  templateUrl: './review-item.html',
  styleUrl: './review-item.css',
})
export class ReviewItem {
  private _userService = inject(UserService);
  review = input<Review>();

  //Agregar funcion para obtener un usuario por su ID
  

}
