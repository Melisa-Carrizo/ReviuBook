import { Component, computed, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookCardComponent } from "../book-card-component/book-card-component";
import { catchError, of } from 'rxjs';
import { Book } from '../../../core/models/Book';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { SearchService } from '../../../core/services/search-service';

@Component({
  selector: 'app-home-component',
  imports: [BookCardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private _bookService = inject(BookService);
  private _searchService = inject(SearchService);
  private snackBar = inject(SnackbarService);
  bookList = toSignal(
    this._bookService.getAllActiveBooks().pipe(
      catchError((err) => {
        return of([] as Book[]);
      })
    ),
    { initialValue: [] as Book[] }
  );

  //Libros filtrados segun el termino de busqueda
  filteredBooks = computed(() => {
    const searchTerm = this._searchService.searchTerm().toLowerCase().trim();
    const allBooks = this.bookList();
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
