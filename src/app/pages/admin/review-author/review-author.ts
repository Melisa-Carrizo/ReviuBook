import { Component, inject, input } from '@angular/core';
import { UserService } from '../../../core/services/user-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-review-author',
  imports: [],
  template: `{{ username() }}`,
})
export class ReviewAuthor {
  private _userService = inject(UserService);
  id = input.required<number>(); // Recibe el id del usuario

  // El componente solo se encarga de obtener el username
  username = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this._userService.getUsernameById(id))
    ), 
    { initialValue: 'Cargando...' }
  );
}
