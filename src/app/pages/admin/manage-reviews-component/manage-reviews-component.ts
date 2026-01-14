import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book-service';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { PaginationBar } from '../../../shared/components/pagination-bar/pagination-bar';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule, PaginationBar],
  templateUrl: './manage-reviews-component.html',
  styleUrl: './manage-reviews-component.css',
})
export class ManageReviewsComponent {
  private _bookService = inject(BookService);
  private _snackBarService = inject(SnackbarService);
  private _router = inject(Router);
  currentPage = signal(0);
  booksPage = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap((page) =>
        this._bookService.getAll(page).pipe(
          catchError((err) => {
            console.error(err);
            this._snackBarService.openErrorSnackBar('Error al cargar la lista de libros.');
            return of({
              content: [],
              page: { number: 0, totalPages: 0, totalElements: 0, size: 0 },
            });
          })
        )
      )
    ),
    { initialValue: { content: [], page: { number: 0, totalPages: 0, totalElements: 0, size: 0 } } }
  );
  isLoading = computed(() => {
    return this.booksPage().content.length === 0 && this.booksPage().page.totalElements === 0;
  });

  pageMetaData = computed(() => {
    const page = this.booksPage().page;

    return {
      number: page.number,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      size: page.size,
    };
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  goToReviews(idBook: number) {
    this._router.navigate(['admin/review-panel', idBook]);
  }
}
