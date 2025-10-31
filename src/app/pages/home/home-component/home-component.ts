import { Component, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookCardComponent } from "../book-card-component/book-card-component";
import { catchError, of } from 'rxjs';
import { Book } from '../../../core/models/Book';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
  selector: 'app-home-component',
  imports: [BookCardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private _bookService = inject(BookService);
  private snackBar = inject(SnackbarService);
  bookList = toSignal(
    this._bookService.getAllActiveBooks().pipe(
      catchError((err) => {
        return of([] as Book[]);
      })
    ),
    { initialValue: [] as Book[] }
  );

  sidebarOpen = signal(false)
  toggleSidebar() { this.sidebarOpen.update(p => !p) }
  closeSidebar() { this.sidebarOpen.set(false) }
}
