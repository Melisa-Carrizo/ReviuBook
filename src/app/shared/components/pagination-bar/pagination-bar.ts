import { Component, computed, input, output } from '@angular/core';
import { PageMeta } from '../../../core/models/PageMeta';

@Component({
  selector: 'app-pagination-bar',
  imports: [],
  templateUrl: './pagination-bar.html',
  styleUrl: './pagination-bar.css',
})
export class PaginationBar {
  data = input.required<PageMeta>();

  pageChange = output<number>();
  
  visiblePages = computed(() => {
    const { number, totalPages } = this.data();

    const start = Math.max(0, number - 2);
    const end = Math.min(totalPages - 1, number + 2);

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  });

  goToPage(page: number) {
    this.pageChange.emit(page);
  }

  next() {
    if (this.data().number < this.data().totalPages-1) {
      this.pageChange.emit(this.data().number + 1);
    }
  }

  prev() {
    if (this.data().number > 0) {
      this.pageChange.emit(this.data().number - 1);
    }
  }
}
