import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, finalize, map, of, switchMap } from 'rxjs';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { ReviewService } from '../../../core/services/review-service';
import { BookService } from '../../../core/services/book-service';
import { Book } from '../../../core/models/Book';
import { Page } from '../../../core/models/Page';

type ReviewFilterType = 'title' | 'word';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule],
  templateUrl: './manage-reviews-component.html',
  styleUrl: './manage-reviews-component.css',
})
export class ManageReviewsComponent {
  private reviewService = inject(ReviewService);
  private snackBarService = inject(SnackbarService);
  private router = inject(Router);
  private bookService = inject(BookService);

  filterTypeDraft = signal<ReviewFilterType>('title');
  termDraft = signal<string>('');

  filterType = signal<ReviewFilterType>('title');
  termFilter = signal<string | null>(null);
  filtersApplied = signal(false);

  page = signal(0);
  readonly pageSize = 10;

  private loading = signal(false);

  private readonly filters$ = combineLatest([
    toObservable(this.filterType),
    toObservable(this.termFilter),
    toObservable(this.filtersApplied),
    toObservable(this.page)
  ]).pipe(
    map(([filter, term, applied, page]) => ({
      filter,
      term: term?.trim() || null,
      applied,
      page
    }))
  );

  booksPage = toSignal(
    this.filters$.pipe(
      switchMap((filters) => {
        if (!filters.applied || !filters.term) {
          return of(this.emptyPage(filters.page));
        }
        this.loading.set(true);
        const term = filters.term;
        const request$ = filters.filter === 'title'
          ? this.bookService.searchBooksByTitlePaged(term, filters.page, this.pageSize)
          : this.bookService.searchBooksByContentPaged(term, filters.page, this.pageSize);

        return request$.pipe(
          catchError((err) => {
            console.error(err);
            this.snackBarService.openErrorSnackBar('Error al cargar los libros.');
            return of(this.emptyPage(filters.page));
          }),
          finalize(() => this.loading.set(false))
        );
      })
    ),
    { initialValue: this.emptyPage(0) }
  );

  books = computed(() => this.booksPage().content ?? []);
  currentPage = computed(() => this.booksPage().page?.number ?? 0);
  totalPages = computed(() => this.booksPage().page?.totalPages ?? 0);

  isLoading = computed(() => this.loading());

  hasBooks = computed(() => this.books().length > 0);
  hasPrev = computed(() => this.currentPage() > 0);
  hasNext = computed(() => this.currentPage() + 1 < this.totalPages());
  showPagination = computed(() => this.totalPages() > 1 || this.books().length >= this.pageSize);

  filterHint = computed(() => {
    const filter = this.filterTypeDraft();
    if (filter === 'title') {
      return 'Busca reseñas asociadas a libros cuyo título coincide total o parcialmente con tu búsqueda.';
    }
    return 'Filtra reseñas cuyo contenido incluya la palabra clave ingresada.';
  });

  shouldShowHint = computed(() => true);

  placeholderForFilter = computed(() => {
    const filter = this.filterTypeDraft();
    if (filter === 'title') return 'Ej: El señor de los anillos';
    return 'Palabra clave dentro de la reseña';
  });

  shouldPromptToApply = computed(() => !this.filtersApplied());

  onFilterTypeDraftChange(value: string) {
    const type: ReviewFilterType = value === 'word' ? 'word' : 'title';
    this.filterTypeDraft.set(type);
    this.filtersApplied.set(false);
  }

  onTermDraftChange(value: string) {
    this.termDraft.set(value ?? '');
    this.filtersApplied.set(false);
  }

  onApplyFilters() {
    const term = this.termDraft().trim();
    this.filterType.set(this.filterTypeDraft());
    this.termFilter.set(term ? term : null);
    this.filtersApplied.set(true);
    this.page.set(0);
    this.loading.set(false);
  }

  goToReviews(bookId: number) {
    this.router.navigate(['admin/review-panel', bookId]);
  }

  onPrevPage() {
    if (this.hasPrev()) {
      this.page.update((p) => Math.max(p - 1, 0));
    }
  }

  onNextPage() {
    if (this.hasNext()) {
      this.page.update((p) => p + 1);
    }
  }

  private emptyPage(page: number): Page<Book> {
    return {
      content: [],
      page: {
        number: page,
        totalPages: 0,
        totalElements: 0,
        size: this.pageSize
      }
    };
  }
}
