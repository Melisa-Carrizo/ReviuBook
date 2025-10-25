import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book } from '../models/Book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8000';

  getBookSheet(id: string) {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }
}
