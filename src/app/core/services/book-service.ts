import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book } from '../models/Book';
import { Page } from '../models/Page';
import { BookSheet } from '../models/BookSheet';
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/books';

  getAllActiveBooks(page: number) {
    return this.http.get<Page<Book>>(`${this.baseUrl}/all/active?page=${page}`);
  }

  getAll(page: number) {
    return this.http.get<Page<Book>>(`${this.baseUrl}/all?page=${page}`);
  }

  getBookById(id:string){
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }

  getBookSheetById(id: string) {
    return this.http.get<BookSheet>(`${this.baseUrl}/bookSheet/${id}`);
  }

  getBookByTitle(title: string) {
    return this.http.get<Book[]>(`${this.baseUrl}/search/title/${title}`);
  }
 

  searchBooks(options: {
    author?: string | null;
    category?: string | null;
    publishingHouse?: string | null;
    fromYear?: number | null;
    toYear?: number | null;
    page: number;
    size: number;
  }) {
    let params = new HttpParams()
      .set('page', options.page)
      .set('size', options.size);

    if (options.author) {
      params = params.set('author', options.author);
    }
    if (options.category) {
      params = params.set('category', options.category.trim().toUpperCase());
    }
    if (options.publishingHouse) {
      params = params.set('publishingHouse', options.publishingHouse.trim());
    }
    if (options.fromYear !== undefined && options.fromYear !== null) {
      params = params.set('fromYear', options.fromYear);
    }
    if (options.toYear !== undefined && options.toYear !== null) {
      params = params.set('toYear', options.toYear);
    }

    return this.http.get<Page<Book>>(`${this.baseUrl}/search`, { params });
  }

  add(book: Book){
    return this.http.post<Book>(`${this.baseUrl}`,book);
  }

  addWithGoogleApi(book: Partial<Book>){
    return this.http.post<Book>(`${this.baseUrl}/create`,book);
  }

  update(book: Book){
    return this.http.put<Book>(`${this.baseUrl}/${book.id}`,book);
  }

  delete(bookId : number){
    return this.http.delete<void>(`${this.baseUrl}/${bookId}`);
  }
}
