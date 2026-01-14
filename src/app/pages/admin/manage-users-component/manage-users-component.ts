import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user-service';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { User } from '../../../core/models/User';
import { UserRow } from '../user-row/user-row';
import { Page } from '../../../core/models/Page';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { PageMeta } from '../../../core/models/PageMeta';

const EMPTY_USER_PAGE: Page<User> = {
  content: [],
  page: {
    number: 0,
    totalPages: 0,
    totalElements: 0,
    size: 0
  }
};
@Component({
  selector: 'app-manage-users-component',
  imports: [UserRow, PaginationBar],
  templateUrl: './manage-users-component.html',
  styleUrl: './manage-users-component.css',
})
export class ManageUsersComponent {
  private _userService = inject(UserService);
  private _snackbarService = inject(SnackbarService); // Inyecta el servicio de notificaciones
  currentPage = signal(0);
  usersPage = toSignal(
  toObservable(this.currentPage).pipe(
    switchMap(page =>
      this._userService.getAll(page).pipe(
        catchError(() => {
          this._snackbarService.openErrorSnackBar(
            'No se pudieron cargar los datos. Intente de nuevo más tarde.'
          );
          return of(EMPTY_USER_PAGE);
        })
      )
    )
  ),
  { initialValue: EMPTY_USER_PAGE }
);

  pageMetaData = computed<PageMeta>(()=>{
    const page = this.usersPage().page;

    return{
      number: page.number,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      size: page.size
    }
  }
  );

  onPageChange(page : number){
    this.currentPage.set(page);
  }
}
