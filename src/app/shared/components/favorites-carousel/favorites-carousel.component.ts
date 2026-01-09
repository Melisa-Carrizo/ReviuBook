import { CommonModule } from '@angular/common';
import { Component, effect, computed, signal } from '@angular/core';
import { input } from '@angular/core';

import { Book } from '../../../core/models/Book';

@Component({
  selector: 'app-favorites-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites-carousel.component.html',
  styleUrl: './favorites-carousel.component.css'
})
export class FavoritesCarouselComponent {
  books = input<Book[] | null>([]);
  defaultCover = input<string>('assets/img/default-book.png');
  pageSize = input<number>(4);

  private currentPage = signal(0);
  private lastLength = -1;
  private animate = signal(false);
  private direction = signal(0);
  private animationTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly visibleBooks = computed(() => {
    const list = this.books() ?? [];
    const start = this.currentPage() * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  readonly showArrows = computed(() => (this.books() ?? []).length > this.pageSize());
  readonly canGoPrev = computed(() => this.currentPage() > 0);
  readonly canGoNext = computed(() => {
    const total = (this.books() ?? []).length;
    return (this.currentPage() + 1) * this.pageSize() < total;
  });

  readonly isAnimating = computed(() => this.animate());
  readonly animationDirection = computed(() => this.direction());

  constructor() {
    effect(() => {
      const list = this.books() ?? [];
      const pageSize = this.pageSize();
      if (this.lastLength !== list.length) {
        this.currentPage.set(0);
        this.lastLength = list.length;
        this.triggerAnimation(0);
      }

      const maxPage = list.length > 0 ? Math.max(0, Math.ceil(list.length / pageSize) - 1) : 0;
      if (this.currentPage() > maxPage) {
        this.currentPage.set(maxPage);
        this.triggerAnimation(0);
      }
    }, { allowSignalWrites: true });
  }

  prev(): void {
    if (this.canGoPrev()) {
      this.currentPage.update(page => page - 1);
      this.triggerAnimation(-1);
    }
  }

  next(): void {
    if (this.canGoNext()) {
      this.currentPage.update(page => page + 1);
      this.triggerAnimation(1);
    }
  }

  private triggerAnimation(direction: number): void {
    this.direction.set(direction);
    this.animate.set(false);

    const raf = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame.bind(window)
      : (fn: FrameRequestCallback) => setTimeout(fn, 16);

    raf(() => {
      this.animate.set(true);
      if (this.animationTimeout !== null) {
        clearTimeout(this.animationTimeout);
      }
      this.animationTimeout = setTimeout(() => {
        this.animate.set(false);
        this.animationTimeout = null;
      }, 250);
    });
  }
}
