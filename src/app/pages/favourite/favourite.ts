import { Component, inject, signal, WritableSignal } from '@angular/core';
import { BookStageService } from '../../core/services/book-stage';
import { Router } from '@angular/router';
import { BookStage } from '../../core/models/BookStage';

@Component({
  selector: 'app-favourite',
  imports: [],
  templateUrl: './favourite.html',
  styleUrl: './favourite.css',
})
export class Favourite {
  private _bookStage = inject(BookStageService);
  private _router = inject(Router);

  favouriteBooks: WritableSignal<BookStage[]> = signal([]);

}
