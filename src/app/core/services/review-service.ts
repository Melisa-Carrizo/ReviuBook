import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from '../models/Review';
import { map, tap } from 'rxjs';

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

  getAllReviewsOfUser(idUser: number) {
    return this.http.get<any[]>(`${this.apiUrl}/allReviews/${idUser}`).pipe(
      map(reviews => Array.isArray(reviews) ? reviews.map(review => this.normalizeReview(review)) : [] )
    );
  }

  normalizeReview(review: any): Review {
    const rawRating = Number(review?.rating ?? review?.ranking ?? 0);
    const normalizedRating = rawRating > 0 ? Math.max(1, Math.min(5, Math.round(rawRating))) : 0;

    return {
      idReview: review?.idReview ?? 0,
      rating: normalizedRating,
      content: review?.content ?? '',
      status: !!review?.status,
      idUser: review?.idUser ?? 0,
      idMultimedia: review?.idMultimedia ?? review?.idBook ?? review?.bookId ?? 0
    };
  }


  addReview(dto: Partial<Review>) {
    return this.http.post<Review>(`${this.apiUrl}`, dto);
  }

  updateReview(dto: Partial<Review>) {
    return this.http.put<Review>(`${this.apiUrl}/${dto.idReview}`, dto);
  }

  enableReview(idReview: number) {
    return this.http.put<Review>(`${this.apiUrl}/enable/${idReview}`, {});
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
