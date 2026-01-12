import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BookStage, Stage } from '../models/BookStage';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookStageService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/bookstage';

  createBookStage(idBook: number) {
    return this.http.post<BookStage>(`${this.baseUrl}/${idBook}`, idBook);
  }

  getAll() {
    return this.http.get<BookStage[]>(`${this.baseUrl}/all`);
  }

  deleteBookStage(idBookStage: number) {
    return this.http.delete<BookStage>(`${this.baseUrl}/${idBookStage}`);
  }

  //Actualiza el estado de un BookStage
  updateStage(idBook: number, newStage: Stage) {
    const data = {
      idBook: idBook,
      stage: newStage
    }
    //Solamente le pasamos el nuevo estado, el back hace el resto
    return this.http.put<BookStage>(`${this.baseUrl}/${idBook}`, data);
  }


  // Verifica si un Libro es favorito, si lo es, devuelve el BookStage
  // si no lo es, devuelve undefined
  getBookStage(idBook: number) {
    return this.getAll().pipe(
      map((bookstages) => {
        return bookstages.find(b => b.book.id === idBook);
      })
    );
  }
}
