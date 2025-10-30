import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from '../models/Review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/user/review';
  private http = inject(HttpClient);

  getReviewById(id: String) {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getAllByBookId(idBook: string) {
    return this.http.get<Review[]>(`${this.apiUrl}/all/${idBook}`);
  }

  // ID del libro para obtener reseña activa del usuario
  getUserReviewByBookAndStatusActive(idBook: string) {
    return this.http.get<Review>(`${this.apiUrl}/userReview/${idBook}`);
  }

  addReview(dto: Partial<Review>) {
    return this.http.post<Review>(`${this.apiUrl}`, dto);
  }
}
