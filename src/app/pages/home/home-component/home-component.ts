import { Component, inject, signal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookCardComponent } from "../book-card-component/book-card-component";

@Component({
  selector: 'app-home-component',
  imports: [BookCardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private _bookService = inject(BookService);

  bookList = toSignal(this._bookService.getAllActiveBooks());

  sidebarOpen = signal(false)
  toggleSidebar() { this.sidebarOpen.update(p => !p) }
  closeSidebar() { this.sidebarOpen.set(false) }
}
