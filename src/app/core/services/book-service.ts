import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book } from '../models/Book';
import { BookSheet } from '../models/BookSheet';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/books';

  getAllActiveBooks():Observable<Book[]>{
    return this.http.get<Book[]>(`${this.baseUrl}/all/active`);
  }

  getAll():Observable<Book[]>{
    return this.http.get<Book[]>(`${this.baseUrl}/all`)
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

  getBooksByAuthor(author: string) {
    return this.http.get<Book[]>(`${this.baseUrl}/search/author/${encodeURIComponent(author)}`);
  }

  getBooksByPublisher(publishingHouse: string) {
    return this.http.get<Book[]>(`${this.baseUrl}/search/publishingHouse/${encodeURIComponent(publishingHouse)}`);
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
