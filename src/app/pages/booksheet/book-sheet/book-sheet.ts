import { Component, inject } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { BookSheet } from '../../../core/models/BookSheet';

@Component({
  selector: 'app-book-sheet',
  imports: [],
  templateUrl: './book-sheet.html',
  styleUrl: './book-sheet.css',
})
export class BookSheetComponent {
  private _bookService = inject(BookService);
  book! : BookSheet;


  getById() {
    // harcodeo para probar
    this._bookService.getBookSheet("11").subscribe({
      next: data => this.book = data
    })
  }
}
