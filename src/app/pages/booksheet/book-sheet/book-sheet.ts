import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal, ɵunwrapWritableSignal } from '@angular/core';
import { BookService } from '../../../core/services/book-service';
import { BookSheet } from '../../../core/models/BookSheet';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, switchMap } from 'rxjs';
import { ReviewList } from '../review-list/review-list';
import { Review } from '../../../core/models/Review';
import { BookStageService } from '../../../core/services/book-stage';
import { ReviewService } from '../../../core/services/review-service';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { PageMeta } from '../../../core/models/PageMeta';
import { Page } from '../../../core/models/Page';
import { ApiConnectionAuth } from '../../../core/services/auth-service';
import { SnackbarService } from '../../../core/services/snackbar-service';

const EMPTY_REVIEW_PAGE: Page<Review> = {
  content: [],
  page : {
      number: 0,
      totalPages: 0,
      totalElements: 0,
      size: 0
  }
};

@Component({
  selector: 'app-book-sheet',
  imports: [ReviewList, PaginationBar],
  templateUrl: './book-sheet.html',
  styleUrl: './book-sheet.css',
})
export class BookSheetComponent {
  private _bookService = inject(BookService);
  private _bookStage = inject(BookStageService);
  private _reviewService = inject(ReviewService);
  private _authService = inject(ApiConnectionAuth);
  private _snackBarService = inject(SnackbarService);
  private route = inject(ActivatedRoute);
  currentPage = signal<number>(0);
  book = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this._bookService.getBookSheetById(params.get('id')!))
    ),
    {initialValue : undefined}
  );
  reviewsDTO = toSignal(
    combineLatest([
      this.route.paramMap,
      toObservable(this.currentPage)
    ]).pipe(
      switchMap(([params, page]) =>
        this._reviewService.getAllActiveByBookId(
          params.get('id')!,
          page
        )
      )
    ),
    { initialValue: EMPTY_REVIEW_PAGE }
  );
  reviews: WritableSignal<Review[]> = signal([]);
  isFavourite: WritableSignal<boolean> = signal(false);
  idBookStage: WritableSignal<number|undefined> = signal(undefined);
  isAdmin: WritableSignal<boolean> = signal(false);
  isLoggedIn: WritableSignal<boolean> = signal(false);
  //separo los metadatos de la pagina
  pageMetadata = computed<PageMeta>(() => {
    const page = this.reviewsDTO().page;

    return {
      number: page.number,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      size: page.size
    };
  });

  //cambio de pagina
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  constructor() {
    this.isAdmin.set(this._authService.isAdmin());
    this.isLoggedIn.set(this._authService.isLoggedIn());
    effect(() => {
      const currentBook = this.book();
      if (currentBook && this.reviewsDTO()?.content) {
        this.reviews.set(this.reviewsDTO()!.content);
      } 
      else {
        this.reviews.set([]);
      }
      // page metadata logged
      if(currentBook && currentBook.id) {
        if(!this.isAdmin() && this.isLoggedIn()){
          this._bookStage.getBookStage(currentBook.id).subscribe({
          next: (bookStage) => {
            if (bookStage) {
              this.isFavourite.set(true);
              this.idBookStage.set(bookStage?.id);
            }
            else {
              this.isFavourite.set(false);
              this.idBookStage.set(undefined);
            }
          },
          error: (err) => {
            console.error("Error al agregar el libro a favoritos: ", err);
            this.isFavourite.set(false);
            this.idBookStage.set(undefined);
          }
        })
        }else{
          this.isFavourite.set(false);
          this.idBookStage.set(undefined);
        }
      }

    }, {allowSignalWrites: true})
  }
  
  handlerReviewDelete(idReview: number) {
    // se actualiza el signal review
    this.reviews.update(reviews => 
      reviews.filter(r => r.idReview !== idReview)
    );
  }

  handlerReviewUpdate(newReview: Review) {
    this.reviews.update(reviews => 
      reviews.map(r => r.idReview === newReview.idReview ? newReview : r)
    );
  }

  addToFavourite() {
    if(this.isLoggedIn())
    {
      this._bookStage.createBookStage(this.book()!.id).subscribe({
      next: (data) => {
        this.isFavourite.set(true);
        this.idBookStage.set(data.id);
      },
      error: (err) => {
        console.error("Error al agregar el libro: ", err);
      }
    });
    }else{
      this._snackBarService.openErrorSnackBar("Debes iniciar sesión");
    }
    
  }

  deleteFromFavourite() {
    const bookStageIdToDelete = this.idBookStage();
    
    if (bookStageIdToDelete === undefined) {
        console.error("No se puede eliminar: El ID del BookStage no está definido.");
        return;
    }

    this._bookStage.deleteBookStage(this.idBookStage()!).subscribe({
      next: (data) => {
        this.isFavourite.set(false);
        this.idBookStage.set(undefined);
      },
      error: (err) => {
        console.error("Error al eliminar el libro: ", err);
      }
    })
  }

}
