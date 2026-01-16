import { Component, computed, effect, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { BookCardComponent } from "../book-card-component/book-card-component";
import { catchError, of } from 'rxjs';
import { Book } from '../../../core/models/Book';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { SearchService } from '../../../core/services/search-service';
import { Page } from '../../../core/models/Page';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { PageMeta } from '../../../core/models/PageMeta';
import { HomeFilterSidebarComponent } from '../filter-sidebar/home-filter-sidebar.component';
import { HomeFilterState, YearRange, Category } from '../home-filter.types';

const buildYearRanges = (currentYear: number): YearRange[] => ([
  {
    id: 'last-5',
    label: 'Últimos 5 años',
    from: currentYear - 4,
    to: currentYear,
  },
  {
    id: 'last-10',
    label: 'Últimos 10 años',
    from: currentYear - 9,
    to: currentYear,
  },
  {
    id: '2000s',
    label: 'Entre 2000 y 2009',
    from: 2000,
    to: 2009,
  },
  {
    id: '1990s',
    label: 'Entre 1990 y 1999',
    from: 1990,
    to: 1999,
  },
  {
    id: 'older',
    label: 'Anterior a 1990',
    to: 1989,
  },
]);

const EMPTY_BOOK_PAGE: Page<Book> = {
  content: [],
  page: {
    number: 0,
    totalPages: 0,
    totalElements: 0,
    size: 0
  }
};

const DEFAULT_PAGE_SIZE = 5;
@Component({
  selector: 'app-home-component',
  imports: [BookCardComponent, PaginationBar, HomeFilterSidebarComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private _bookService = inject(BookService);
  private _searchService = inject(SearchService);
  private snackBar = inject(SnackbarService);
  currentPage = signal(0);
  bookPage = signal<Page<Book>>(EMPTY_BOOK_PAGE);

  selectedCategories = signal<Category[]>([]);
  selectedYearRange = signal<string | null>(null);
  authorQuery = signal<string | null>(null);
  publisherQuery = signal<string | null>(null);

  readonly currentFilters = computed<HomeFilterState>(() => ({
    categories: this.selectedCategories(),
    yearRangeId: this.selectedYearRange(),
    authorQuery: this.authorQuery(),
    publisherQuery: this.publisherQuery(),
  }));

  private readonly hasActiveFilters = computed(() => {
    return !!(
      this.selectedCategories().length ||
      this.selectedYearRange() ||
      (this.authorQuery()?.trim()) ||
      (this.publisherQuery()?.trim())
    );
  });

  readonly displayedBooks = computed(() => {
    const searchTerm = this._searchService.searchTerm().toLowerCase().trim();
    const items = this.bookPage().content;
    if (!searchTerm) {
      return items;
    }

    return items.filter((book) =>
      book.title.toLocaleLowerCase().includes(searchTerm) ||
      book.author.toLocaleLowerCase().includes(searchTerm)
    );
  });

  private readonly yearRanges = buildYearRanges(new Date().getFullYear());

  readonly availableCategories = computed(() => {
    return [
      Category.NOVELA,
      Category.CIENCIA_FICCION,
      Category.BIOGRAFIA,
      Category.HISTORIA,
      Category.FANTASIA,
      Category.INFANTIL,
      Category.TERROR,
      Category.ROMANCE,
    ];
  });

  //cargo los libros al cargar la pagina
    constructor() {
      effect(() => {
        const page = this.currentPage();
        const filters = this.currentFilters();
        const hasFilters = this.hasActiveFilters();
        const yearBounds = this.getYearBounds(filters.yearRangeId);

        const categoryParam = filters.categories[0] ? filters.categories[0].toString().trim().toUpperCase() : undefined;

        const request$ = hasFilters
          ? this._bookService.searchBooks({
              author: filters.authorQuery?.trim() || undefined,
              category: categoryParam,
              publishingHouse: filters.publisherQuery?.trim() || undefined,
              fromYear: yearBounds.from,
              toYear: yearBounds.to,
              page,
              size: DEFAULT_PAGE_SIZE,
            })
          : this._bookService.getAllActiveBooks(page);

        request$
          .pipe(
            catchError(() => {
              this.snackBar.openErrorSnackBar('Error al cargar libros');
              return of(EMPTY_BOOK_PAGE);
            })
          )
          .subscribe((result) => {
            this.bookPage.set(result);
          });
      });
  }

  //separo los metadatos de la pagina
  pageMetadata = computed<PageMeta>(() => {
    const page = this.bookPage().page;
    return {
      number: page.number,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      size: page.size
    };
  });

  //cambio de pagina
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  getYearRanges(): YearRange[] {
    return this.yearRanges;
  }

  handleApplyFilters(filters: HomeFilterState): void {
    this.selectedCategories.set([...filters.categories]);
    this.selectedYearRange.set(filters.yearRangeId);
    this.authorQuery.set(filters.authorQuery);
    this.publisherQuery.set(filters.publisherQuery);
    this.currentPage.set(0);
  }

  private getYearBounds(rangeId: string | null): { from: number | null; to: number | null } {
    if (!rangeId) {
      return { from: null, to: null };
    }

    const range = this.yearRanges.find((r) => r.id === rangeId);
    return {
      from: range?.from ?? null,
      to: range?.to ?? null,
    };
  }
}
