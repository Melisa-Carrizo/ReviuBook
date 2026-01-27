import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from '../models/Review';
import { map, Observable, tap } from 'rxjs';
import { Page } from '../models/Page';

export interface AdminReviewSummary {
  idReview: number;
  bookId: number;
  bookTitle: string;
  username: string;
  rating: number;
  content: string;
  status: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/review';
  private http = inject(HttpClient);

  getReviewById(id: String) {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getAllByBookId(idBook: string, page : number) {
    return this.http.get<Page<Review>>(`${this.apiUrl}/all/${idBook}?page=${page}`);
  }

  getAllActiveByBookId(idBook:string, page : number):Observable<Page<Review>>{
    return this.http.get<Page<Review>>(`${this.apiUrl}/active/${idBook}?page=${page}`);
  }

  searchReviewsByBookTitle(options: { page: number; title: string; }) {
    const params = new HttpParams().set('page', options.page);
    const title = options.title.trim();
    return this.http.get<Page<Review>>(
      `${this.apiUrl}/by-book-title/${encodeURIComponent(title)}`,
      { params }
    );
  }

  searchReviewsByContent(options: { page: number; term: string; }) {
    const params = new HttpParams().set('page', options.page);
    const term = options.term.trim();
    return this.http.get<Page<Review>>(
      `${this.apiUrl}/search-content/${encodeURIComponent(term)}`,
      { params }
    );
  }

  // ID del libro para obtener reseña activa del usuario
  getUserReviewByBookAndStatusActive(idBook: number) {
    return this.http.get<Review>(`${this.apiUrl}/userReview/${idBook}`).pipe(
      tap(() => {/* review fetched */})
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
