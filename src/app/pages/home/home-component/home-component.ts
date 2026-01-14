import { Component, computed, effect, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookCardComponent } from "../book-card-component/book-card-component";
import { catchError, of } from 'rxjs';
import { Book } from '../../../core/models/Book';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { SearchService } from '../../../core/services/search-service';
import { Page } from '../../../core/models/Page';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { PageMeta } from '../../../core/models/PageMeta';


const EMPTY_BOOK_PAGE: Page<Book> = {
  content: [],
  last: true,
  totalPages: 0,
  first: true,
  number: 0
};
@Component({
  selector: 'app-home-component',
  imports: [BookCardComponent, PaginationBar],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private _bookService = inject(BookService);
  private _searchService = inject(SearchService);
  private snackBar = inject(SnackbarService);

  currentPage = signal(0);
  bookPage = signal<Page<Book>>(EMPTY_BOOK_PAGE);

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
  
  //Libros filtrados segun el termino de busqueda
  filteredBooks = computed(() => {
    const searchTerm = this._searchService.searchTerm().toLowerCase().trim();
    const allBooks = this.bookPage().content;
    // si no hay termino de busqueda, se muestra la lista original
    if (!searchTerm) {
      return allBooks
    }
    // se filtran los libros segun su titulo o autor
    return allBooks.filter(b => 
      b.title.toLocaleLowerCase().includes(searchTerm) ||
      b.author.toLocaleLowerCase().includes(searchTerm)
    );
  })

  sidebarOpen = signal(false)
  toggleSidebar() { this.sidebarOpen.update(p => !p) }
  closeSidebar() { this.sidebarOpen.set(false) }
}
