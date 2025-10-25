import { Component, inject, OnInit } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { BookSheet } from '../../../core/models/BookSheet';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-book-sheet',
  imports: [],
  templateUrl: './book-sheet.html',
  styleUrl: './book-sheet.css',
})
export class BookSheetComponent {
  private _bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  //book! : BookSheet;

  book = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this._bookService.getBookSheetById(params.get('id')!))
    ),
    {initialValue : undefined}
  );


  
}
