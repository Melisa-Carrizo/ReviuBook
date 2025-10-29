import { Component, inject, input } from '@angular/core';
import { Book } from '../../../core/models/Book';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
@Component({
  selector: 'app-book-card-component',
  imports: [MatButtonModule],
  templateUrl: './book-card-component.html',
  styleUrl: './book-card-component.css',
})
export class BookCardComponent {
  book = input.required<Book>();
  private router = inject(Router);

  goToDetails(){
    this.router.navigate(['libro', this.book().id]);
  }
}
