import { Component, input, output } from '@angular/core';
import { Book } from '../../../core/models/Book';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-book-preview-component',
  imports: [DatePipe],
  templateUrl: './book-preview-component.html',
  styleUrl: './book-preview-component.css',
})
export class BookPreviewComponent {
  book = input.required<Book>();
  editBook = output<Book>();
  deleteBook = output<Book>();

  onEdit() {
    this.editBook.emit(this.book());
  }

  onDelete() {
    this.deleteBook.emit(this.book());
  }
}