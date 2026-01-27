import { SnackbarService } from './../../../core/services/snackbar-service';
import { Component, inject, signal, output } from '@angular/core';
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
import { FavoritesCarouselComponent } from '../favorites-carousel/favorites-carousel.component';
import Swal, { SweetAlertResult } from 'sweetalert2';

type ReviewCard = {
  id: number;
  content: string;
  bookTitle: string;
  publishingHouse: string;
  urlImage: string;
  rating: number;
  status: boolean;
};

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, FavoritesCarouselComponent],
  templateUrl: './user-profile-modal.html',
  styleUrl: './user-profile-modal.css'
})
export class UserProfileModalComponent {

  private dialogRef = inject(MatDialogRef<UserProfileModalComponent>);
  private data = inject<{ email: string; username?: string; id: number }>(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private bookService = inject(BookService);
  private snackbarService = inject(SnackbarService);
  defaultCover = 'assets/img/default-book.png';

  username = signal(this.data?.username ?? 'Nombre del usuario');
  email = signal(this.data?.email ?? 'Correo electrónico');
  id = signal(this.data?.id ?? 0);
  favorites = signal<Book[]>([]);
  reviews = signal<ReviewCard[]>([]);
  status = signal<boolean>(true);

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

  private loadFavorites(email: string): void {
    this.userService.getFavoriteListByEmail(email).subscribe({
      next: list => this.favorites.set(list ?? []),
      error: () => this.favorites.set([])
    });
  }

  /* ===================== USUARIO + REVIEWS ===================== */

  private loadUserData(email: string, providedId?: number): void {
    this.userService.getUserByEmailRaw(email).subscribe({
      next: user => {
        this.username.set(user?.username ?? this.username());
        this.email.set(user?.email ?? this.email());
        this.status.set(user?.status ?? this.status());

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

    this.reviewService.getAllReviewsOfUser(userId).pipe(
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

  hasActiveReviews(): boolean {
    return (this.reviews() ?? []).some(r => r.status);
  }

  private mapReviewToCard(review: Review, fallbackIndex: number) {
    const reviewAny: any = review as any;
    const bookId: number | undefined = reviewAny?.idMultimedia ?? reviewAny?.idBook ?? reviewAny?.bookId;

    const baseCard: ReviewCard = {
      id: review?.idReview ?? fallbackIndex,
      content: review?.content ?? '',
      bookTitle: 'Libro sin título',
      publishingHouse: '',
      urlImage: this.defaultCover,
      rating: review?.rating ?? 0,
      status: review?.status ?? false
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
        rating: baseCard.rating,
        status: baseCard.status
      })),
      catchError(() => of(baseCard))
    );
  }

changeStatus() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¡No podrás revertir esto!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  }).then((result: SweetAlertResult<any>) => {
    if (result.isConfirmed) {
      if (this.status()) {
        this.userService.deleteUser(this.id()).subscribe({
          next: () => {
            this.snackbarService.openSuccessSnackBar('¡Cuenta deshabilitada!');
            this.status.set(false);
            this.dialogRef.close({
              userId: this.email(),
              status: false
            });
          },
          error: (err) => {
            let errorMessage = 'Error desconocido al borrar el libro.';
                            if (err.status === 400) {
                                errorMessage = 'No tienes permisos para realizar esta acción.';
                            }
            this.snackbarService.openErrorSnackBar(
              errorMessage
            );
          }
        });
      } else {
        this.userService.activateUser(this.id()).subscribe({
          next: () => {
            this.snackbarService.openSuccessSnackBar('¡Cuenta habilitada!');
            this.status.set(true);
            this.dialogRef.close({
              email: this.email(),
              status: true
            });
          },
          error: () => {
            this.snackbarService.openErrorSnackBar(
              'Error desconocido al habilitar la cuenta.'
            );
          }
        });
      }
    }
  });
}
}
