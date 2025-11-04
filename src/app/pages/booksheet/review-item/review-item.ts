import { Component, computed, inject, input } from '@angular/core';
import { Review } from '../../../core/models/Review';
import { UserService } from '../../../core/services/user-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, filter, switchMap } from 'rxjs';
@Component({
  selector: 'app-review-item',
  imports: [],
  templateUrl: './review-item.html',
  styleUrl: './review-item.css',
})
export class ReviewItem {
  private _userService = inject(UserService);
  review = input<Review>();
  
  private user$ = toObservable(this.review).pipe(
    map(review => review?.idUser),
    filter((id): id is number => !!id),
    switchMap(id => this._userService.getUsernameById(id))
  );

  // user = toSignal(this.user$, {initialValue: undefined})

  username = toSignal(this.user$, {initialValue: undefined});
}
