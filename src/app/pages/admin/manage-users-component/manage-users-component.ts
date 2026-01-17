import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user-service';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { catchError, Observable, of, switchMap, map, combineLatest } from 'rxjs';
import { User } from '../../../core/models/User';
import { UserRow } from '../user-row/user-row';
import { Page } from '../../../core/models/Page';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { PageMeta } from '../../../core/models/PageMeta';
import { FilterPanelComponent } from '../../../shared/components/filter-panel/filter-panel.component';

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
  imports: [UserRow, PaginationBar, FilterPanelComponent],
  templateUrl: './manage-users-component.html',
  styleUrl: './manage-users-component.css',
})
export class ManageUsersComponent {
  private _userService = inject(UserService);
  private _snackbarService = inject(SnackbarService); // Inyecta el servicio de notificaciones
  currentPage = signal(0);
  usernameDraft = signal<string>('');
  statusDraft = signal<'all' | 'active' | 'inactive'>('all');

  usernameFilter = signal<string | null>(null);
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  private filtersSignal = computed(() => ({
    page: this.currentPage(),
    username: this.usernameFilter(),
    active: this.statusFilter()
  }));

  usersPage = toSignal(
    combineLatest([
      toObservable(this.currentPage),
      toObservable(this.usernameFilter).pipe(map(s => s)),
      toObservable(this.statusFilter).pipe(map(s => (s === 'all' ? null : (s === 'active'))))
    ]).pipe(
      switchMap(([page, username, active]) =>
        this._userService.searchUsers({ username, active, page }).pipe(
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

  onUsernameDraftChange(value: string){
    this.usernameDraft.set(value ?? '');
  }

  onStatusDraftChange(value: string){
    const v = value === 'active' ? 'active' : (value === 'inactive' ? 'inactive' : 'all');
    this.statusDraft.set(v as 'all'|'active'|'inactive');
  }

  onApplyFilters(){
    const username = this.usernameDraft().trim();
    this.usernameFilter.set(username ? username : null);
    this.statusFilter.set(this.statusDraft());
    this.currentPage.set(0);
  }
}
