import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/Review';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { ReviewAuthor } from '../review-author/review-author';
import { NgTemplateOutlet } from '@angular/common';
import { Page } from '../../../core/models/Page';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";

export interface ReviewWithUsername extends Review {
  username: String;
}

const EMPTY_REVIEW_PAGE: Page<Review> = {
  content: [],
  page: {
    number: 0,
    totalPages: 0,
    totalElements: 0,
    size: 0
  }
};

@Component({
  selector: 'app-review-panel',
  imports: [ReviewAuthor, NgTemplateOutlet, PaginationBar],
  templateUrl: './review-panel.html',
  styleUrl: './review-panel.css',
})
export class ReviewPanel {
  private _reviewService = inject(ReviewService);
  private _bookService = inject(BookService);
  private _route = inject(ActivatedRoute);

  currentPage = signal(0);

  selectedBook = toSignal(
    this._route.paramMap.pipe(
      switchMap(params => this._bookService.getBookById(params.get('id')!))
    ),
    {initialValue : undefined}
  );

  reviewsPage = signal<Page<Review>>(EMPTY_REVIEW_PAGE);
  reviews = computed(() => this.reviewsPage().content);

  constructor() {
  effect(() => {
    const book = this.selectedBook();
    const page = this.currentPage();

    if (!book) return;

    const bookId = String(book.id);

    this._reviewService.getAllByBookId(bookId, page).subscribe({
      next: (data) => {
        this.reviewsPage.set(data);
      },
      error: err =>
        console.error('Error al obtener las reviews:', err.message)
    });
    }, { allowSignalWrites: true });
  };

  pageMetaData = computed(() => {
    const page = this.reviewsPage().page;

    return {
      number: page.number,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      size: page.size
    };
  });
  
  onPageChange(page: number) {
    this.currentPage.set(page);
  };
  
  disableReview(idReview: number) {
    this._reviewService.deleteReviewAdmin(idReview).subscribe({
      next: () => {
        this.reviewsPage.update(page => ({
          ...page,
          content: page.content.map(r =>
            r.idReview === idReview ? { ...r, status: false } : r
          )
        }));
      },
      error: e => console.error(e.message)
    });
  };



  enableReview(review: Review) {
    const updated = { ...review, status: true };

    this._reviewService.updateReviewAdmin(updated).subscribe({
      next: data => {
        this.reviewsPage.update(page => ({
          ...page,
          content: page.content.map(r =>
            r.idReview === data.idReview ? data : r
          )
        }));
      },
      error: err => console.error(err.message)
    });
  };

}
