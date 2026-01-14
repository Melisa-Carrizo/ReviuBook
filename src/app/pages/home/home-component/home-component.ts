import { Component, computed, effect, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookCardComponent } from "../book-card-component/book-card-component";
import { catchError, forkJoin, of } from 'rxjs';
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
  last: true,
  totalPages: 0,
  first: true,
  number: 0
};
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
  private authorBooks = signal<Book[] | null>(null);
  private publisherBooks = signal<Book[] | null>(null);
  private categoryBooks = signal<Book[] | null>(null);

  readonly currentFilters = computed<HomeFilterState>(() => ({
    categories: this.selectedCategories(),
    yearRangeId: this.selectedYearRange(),
    authorQuery: this.authorQuery(),
    publisherQuery: this.publisherQuery(),
  }));

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

        this._bookService.getAllActiveBooks(page).pipe(
          catchError(() => {
            this.snackBar.openErrorSnackBar('Error al cargar libros');
            return of(EMPTY_BOOK_PAGE);
          })
        ).subscribe(result => {
          this.bookPage.set(result);
        });
      });
  }

  //separo los metadatos de la pagina
  pageMetadata = computed<PageMeta>(() => {
    const page = this.bookPage();

    return {
      first: page.first,
      last: page.last,
      number: page.number,
      totalPages: page.totalPages
    };
  });

  //cambio de pagina
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  //Libros filtrados segun el termino de busqueda y filtros laterales
  filteredBooks = computed(() => {
    const searchTerm = this._searchService.searchTerm().toLowerCase().trim();
    const allBooks = this.bookPage().content;
    const categories = this.selectedCategories();
    const yearRangeId = this.selectedYearRange();
    const range = yearRangeId ? this.yearRanges.find((r) => r.id === yearRangeId) : undefined;
    const authorTerm = this.authorQuery()?.toLowerCase().trim() ?? '';
    const publisherTerm = this.publisherQuery()?.toLowerCase().trim() ?? '';

    let source = allBooks;
    if (authorTerm) {
      source = this.authorBooks() ?? [];
    }

    if (publisherTerm) {
      const publisherDataset = this.publisherBooks() ?? [];
      if (authorTerm) {
        const publisherIds = new Set(publisherDataset.map((b) => b.id));
        source = source.filter((book) => publisherIds.has(book.id));
      } else {
        source = publisherDataset;
      }
    }

    if (categories.length) {
      const categoryDataset = this.categoryBooks();
      if (categoryDataset && categoryDataset.length) {
        if (authorTerm || publisherTerm) {
          const categoryIds = new Set(categoryDataset.map((b) => b.id));
          source = source.filter((book) => categoryIds.has(book.id));
        } else {
          source = categoryDataset;
        }
      } else {
        source = [];
      }
    }

    return source.filter((book) => {
      const matchesSearch = !searchTerm
        || book.title.toLocaleLowerCase().includes(searchTerm)
        || book.author.toLocaleLowerCase().includes(searchTerm);

      if (!matchesSearch) {
        return false;
      }

      const bookCategory = book.category?.trim() as Category | undefined;
      const matchesCategory = !categories.length || (!!bookCategory && categories.includes(bookCategory));
      if (!matchesCategory) {
        return false;
      }

      if (publisherTerm) {
        const matchesPublisher = !!book.publishingHouse && book.publishingHouse.toLocaleLowerCase().includes(publisherTerm);
        if (!matchesPublisher) {
          return false;
        }
      }

      if (authorTerm) {
        const matchesAuthor = !!book.author && book.author.toLocaleLowerCase().includes(authorTerm);
        if (!matchesAuthor) {
          return false;
        }
      }

      if (!range) {
        return true;
      }

      const year = this.getBookYear(book);
      return year !== null && this.isYearInRange(year, range);
    });
  });

  getYearRanges(): YearRange[] {
    return this.yearRanges;
  }

  handleApplyFilters(filters: HomeFilterState): void {
    this.selectedCategories.set([...filters.categories]);
    this.selectedYearRange.set(filters.yearRangeId);
    this.authorQuery.set(filters.authorQuery);
    this.publisherQuery.set(filters.publisherQuery);
    this.refreshRemoteDatasets(filters);
  }

  private refreshRemoteDatasets(filters: HomeFilterState): void {
    this.fetchBooksByAuthor(filters.authorQuery);
    this.fetchBooksByPublisher(filters.publisherQuery);
    this.fetchBooksByCategories(filters.categories);
  }

  private fetchBooksByAuthor(author: string | null): void {
    const trimmed = author?.trim();
    if (!trimmed) {
      this.authorBooks.set(null);
      return;
    }

    console.log('[Filtros] Buscando libros por autor:', trimmed);
    this._bookService
      .getBooksByAuthor(trimmed)
      .pipe(
        catchError(() => {
          this.snackBar.openErrorSnackBar('No se pudieron cargar los libros para ese autor.');
          return of([] as Book[]);
        })
      )
      .subscribe((books) => this.authorBooks.set(books));
  }

  private fetchBooksByPublisher(publisher: string | null): void {
    const trimmed = publisher?.trim();
    if (!trimmed) {
      this.publisherBooks.set(null);
      return;
    }

    console.log('[Filtros] Buscando libros por editorial:', trimmed);
    this._bookService
      .getBooksByPublisher(trimmed)
      .pipe(
        catchError(() => {
          this.snackBar.openErrorSnackBar('No se pudieron cargar los libros para esa editorial.');
          return of([] as Book[]);
        })
      )
      .subscribe((books) => this.publisherBooks.set(books));
  }

  private fetchBooksByCategories(categories: Category[]): void {
    if (!categories || !categories.length) {
      this.categoryBooks.set(null);
      return;
    }

    this.categoryBooks.set([]);
    let hadError = false;
    const requests = categories.map((category) =>
      this._bookService
        .getBooksByCategory(category)
        .pipe(
          catchError(() => {
            hadError = true;
            return of([] as Book[]);
          })
        )
    );

    forkJoin(requests).subscribe((results) => {
      if (hadError) {
        this.snackBar.openErrorSnackBar('No se pudieron cargar algunos libros para esa categoría.');
      }

      const merged = results.flat();
      const map = new Map<string | number, Book>();
      merged.forEach((book) => {
        if (book && book.id !== undefined && book.id !== null) {
          map.set(book.id, book);
        }
      });
      this.categoryBooks.set(Array.from(map.values()));
    });
  }

  private getBookYear(book: Book): number | null {
    if (!book.releaseDate) {
      return null;
    }

    const date = new Date(book.releaseDate);
    const year = date.getFullYear();
    return Number.isNaN(year) ? null : year;
  }

  private isYearInRange(year: number, range: YearRange): boolean {
    if (range.from !== undefined && year < range.from) {
      return false;
    }

    if (range.to !== undefined && year > range.to) {
      return false;
    }

    return true;
  }
}
