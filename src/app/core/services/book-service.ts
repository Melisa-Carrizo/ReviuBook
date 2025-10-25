import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book } from '../models/Book';
import { BookSheet } from '../models/BookSheet';
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8080';

  getBookSheet(id: string) {
    return this.http.get<BookSheet>(`${this.baseUrl}/${id}`);
  }
}
