import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from '../models/Review';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/review';
  private http = inject(HttpClient);

  getReviewById(id: String) {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getAllByBookId(idBook: string) {
    return this.http.get<Review[]>(`${this.apiUrl}/all/${idBook}`);
  }

  // ID del libro para obtener reseña activa del usuario
  getUserReviewByBookAndStatusActive(idBook: number) {
    return this.http.get<Review>(`${this.apiUrl}/userReview/${idBook}`).pipe(
      tap(data => console.log("Review: " + data))
    );
  }

  addReview(dto: Partial<Review>) {
    return this.http.post<Review>(`${this.apiUrl}`, dto);
  }

  updateReview(dto: Partial<Review>) {
    return this.http.put<Review>(`${this.apiUrl}/${dto.idReview}`, dto);
  }

  // Eliminar review para el rol User
  deleteReview(id: number) {
    return this.http.delete<Review>(`${this.apiUrl}/${id}`)
  }
  // Eliminar review para el rol Admin
  deleteReviewAdmin(id: number) {
    return this.http.delete<Review>(`${this.apiUrl}/admin/${id}`)
  }
}
