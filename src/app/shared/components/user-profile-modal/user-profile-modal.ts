import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { UserService } from '../../../core/services/user-service';
import { ReviewService } from '../../../core/services/review-service';
import { BookService } from '../../../core/services/book-service';
import { Book } from '../../../core/models/Book';
import { Review } from '../../../core/models/Review';

type ReviewCard = {
  id: number;
  content: string;
  bookTitle: string;
  publishingHouse: string;
  urlImage: string;
  rating: number;
};

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './user-profile-modal.html',
  styleUrl: './user-profile-modal.css'
})
export class UserProfileModalComponent {

  private dialogRef = inject(MatDialogRef<UserProfileModalComponent>);
  private data = inject<{ email: string; username?: string; id: number }>(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private bookService = inject(BookService);
  defaultCover = 'assets/img/default-book.png';


  username = signal(this.data?.username ?? 'Nombre del usuario');
  email = signal(this.data?.email ?? 'Correo electrónico');
  id = signal(this.data?.id ?? 0);
  favorites = signal<Book[]>([]);
  reviews = signal<ReviewCard[]>([]);
  favoritesPage = signal(0); // índice de página para el carrusel

  constructor() {
    const email = this.email();
    const providedId = this.data?.id;

    if (email) {
      this.loadFavorites(email);
      this.loadUserData(email, providedId);
    }

    if (providedId) {
      this.loadReviewsForUser(providedId);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  /* ===================== FAVORITOS ===================== */

  private loadFavorites(email: string): void {
    this.userService.getFavoriteListByEmail(email).subscribe({
      next: list => this.favorites.set(list ?? []),
      error: () => this.favorites.set([])
    });
  }

  // Carrusel: 4 favoritos por página
  visibleFavorites(): Book[] {
    const all = this.favorites() ?? [];
    const page = this.favoritesPage();
    const pageSize = 4;
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  }

  canGoPrevFavorites(): boolean {
    return this.favoritesPage() > 0;
  }

  canGoNextFavorites(): boolean {
    const total = (this.favorites() ?? []).length;
    const pageSize = 4;
    return (this.favoritesPage() + 1) * pageSize < total;
  }

  prevFavoritesPage(): void {
    if (this.canGoPrevFavorites()) {
      this.favoritesPage.update(v => v - 1);
    }
  }

  nextFavoritesPage(): void {
    if (this.canGoNextFavorites()) {
      this.favoritesPage.update(v => v + 1);
    }
  }

  /* ===================== USUARIO + REVIEWS ===================== */

  private loadUserData(email: string, providedId?: number): void {
    this.userService.getUserByEmailRaw(email).subscribe({
      next: user => {
        this.username.set(user?.username ?? this.username());
        this.email.set(user?.email ?? this.email());

        const userId = providedId ?? this.extractUserId(user);
        if (userId) {
          this.id.set(userId);
          if (!providedId) {
            this.loadReviewsForUser(userId);
          }
        }
      },
      error: () => {
        if (!providedId) {
          this.reviews.set([]);
        }
      }
    });
  }

  private extractUserId(user: any): number | null {
    const keys = ['id', 'idUser', 'userId', 'user_id'];
    for (const key of keys) {
      const value = user?.[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return null;
  }

  private loadReviewsForUser(userId?: number | null): void {
    if (!userId) {
      this.reviews.set([]);
      return;
    }

    this.reviewService.getAllReviewsActiveOfUser(userId).pipe(
      switchMap(reviews => {
        if (!Array.isArray(reviews) || !reviews.length) {
          return of<ReviewCard[]>([]);
        }

        const cards$ = reviews.map((review, index) =>
          this.mapReviewToCard(review, index).pipe(catchError(() => of(null)))
        );

        return forkJoin(cards$).pipe(
          map(cards => cards.filter((card): card is ReviewCard => !!card))
        );
      }),
      catchError(() => of<ReviewCard[]>([]))
    ).subscribe(cards => this.reviews.set(cards));
  }

  private mapReviewToCard(review: Review, fallbackIndex: number) {
    const reviewAny: any = review as any;
    const bookId: number | undefined = reviewAny?.idMultimedia ?? reviewAny?.idBook ?? reviewAny?.bookId;

    const rawRating = Number(reviewAny?.rating ?? reviewAny?.ranking ?? 0);
    const normalizedRating = rawRating > 0 ? Math.max(1, Math.min(5, Math.round(rawRating))) : 0;

    const baseCard: ReviewCard = {
      id: review?.idReview ?? fallbackIndex,
      content: review?.content ?? '',
      bookTitle: 'Libro sin título',
      publishingHouse: '',
      urlImage: this.defaultCover,
      rating: normalizedRating
    };

    if (!bookId) {
      return of(baseCard);
    }

    return this.bookService.getBookSheetById(String(bookId)).pipe(
      map((book: any) => ({
        id: baseCard.id,
        content: baseCard.content,
        bookTitle: book?.title ?? baseCard.bookTitle,
        publishingHouse: book?.publishingHouse ?? baseCard.publishingHouse,
        urlImage: book?.urlImage ?? this.defaultCover,
        rating: baseCard.rating
      })),
      catchError(() => of(baseCard))
    );
  }
}
