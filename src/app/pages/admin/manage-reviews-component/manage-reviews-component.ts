import { Component, computed, effect, inject, signal } from '@angular/core';
import { SearchService } from '../../../core/services/search-service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book-service';
import { Review } from '../../../core/models/Review';
import { ReviewService } from '../../../core/services/review-service';
import { Book } from '../../../core/models/Book';
import { ReviewItem } from '../../booksheet/review-item/review-item';

@Component({
  selector: 'app-manage-reviews-component',
  imports: [FormsModule, ReviewItem],
  templateUrl: './manage-reviews-component.html',
  styleUrl: './manage-reviews-component.css',
})
export class ManageReviewsComponent {
 

}
