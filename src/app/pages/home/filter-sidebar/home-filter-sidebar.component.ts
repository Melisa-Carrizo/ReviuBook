import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeFilterState, YearRange, Category } from '../home-filter.types';

@Component({
  selector: 'app-home-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-filter-sidebar.component.html',
  styleUrl: './home-filter-sidebar.component.css',
})
export class HomeFilterSidebarComponent implements OnChanges {
  @Input() categories: Category[] = [];
  @Input() yearRanges: YearRange[] = [];
  @Input() filters: HomeFilterState = {
    categories: [],
    yearRangeId: null,
    authorQuery: null,
    publisherQuery: null,
  };

  @Output() applyFilters = new EventEmitter<HomeFilterState>();

  protected readonly localCategories = signal<Category[]>([]);
  protected readonly localYearRange = signal<string | null>(null);
  protected readonly authorFilterEnabled = signal(false);
  protected readonly authorText = signal('');
  protected readonly publisherFilterEnabled = signal(false);
  protected readonly publisherText = signal('');
  protected readonly panelOpen = signal(true);
  protected readonly mobilePanelOpen = signal(false);

  private lastAppliedFilters: HomeFilterState = {
    categories: [],
    yearRangeId: null,
    authorQuery: null,
    publisherQuery: null,
  };

  private initialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.handleFiltersChange();
    }
  }

  protected formatCategoryLabel(category: Category | string): string {
    if (!category) {
      return '';
    }
    const map: Record<string, string> = {
      'NOVELA': 'Novela',
      'CIENCIA_FICCION': 'Ciencia ficción',
      'BIOGRAFIA': 'Biografía',
      'HISTORIA': 'Historia',
      'FANTASIA': 'Fantasía',
      'INFANTIL': 'Infantil',
      'TERROR': 'Terror',
      'ROMANCE': 'Romance',
    };
    const key = category.trim();
    if (map[key]) {
      return map[key];
    }
    const lower = key.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  protected toggleCategory(category: Category): void {
    this.localCategories.update((current) => this.toggleValue(current, category));
  }

  protected selectYearRange(rangeId: string): void {
    this.localYearRange.update((current) => (current === rangeId ? null : rangeId));
  }

  protected toggleAuthorFilter(enabled: boolean): void {
    this.authorFilterEnabled.set(enabled);
    if (!enabled) {
      this.authorText.set('');
    }
  }

  protected updateAuthorText(value: string): void {
    this.authorText.set(value ?? '');
  }

  protected togglePublisherFilter(enabled: boolean): void {
    this.publisherFilterEnabled.set(enabled);
    if (!enabled) {
      this.publisherText.set('');
    }
  }

  protected updatePublisherText(value: string): void {
    this.publisherText.set(value ?? '');
  }

  protected onApplyClicked(): void {
    const payload: HomeFilterState = {
      categories: [...this.localCategories()],
      yearRangeId: this.localYearRange(),
      authorQuery: this.authorFilterEnabled() ? (this.authorText().trim() || null) : null,
      publisherQuery: this.publisherFilterEnabled() ? (this.publisherText().trim() || null) : null,
    };
    this.syncStateFromFilters(payload);
    this.applyFilters.emit(payload);
    this.mobilePanelOpen.set(false);
  }

  protected onCancelClicked(): void {
    this.restoreLocalState();
    this.panelOpen.set(false);
    this.mobilePanelOpen.set(false);
  }

  protected togglePanel(): void {
    this.panelOpen.update((open) => !open);
  }

  protected openMobilePanel(): void {
    this.mobilePanelOpen.set(true);
  }

  protected handleMobileClose(): void {
    this.restoreLocalState();
    this.mobilePanelOpen.set(false);
  }

  private handleFiltersChange(): void {
    if (!this.filters) {
      return;
    }

    if (!this.initialized || !this.filtersEqual(this.filters, this.lastAppliedFilters)) {
      this.syncStateFromFilters(this.filters);
      this.initialized = true;
    }
  }

  private syncStateFromFilters(source: HomeFilterState): void {
    this.lastAppliedFilters = this.cloneFilters(source);
    this.applyFiltersToLocalState(this.lastAppliedFilters);
  }

  private restoreLocalState(): void {
    this.applyFiltersToLocalState(this.lastAppliedFilters);
  }

  private applyFiltersToLocalState(source: HomeFilterState): void {
    this.localCategories.set([...source.categories]);
    this.localYearRange.set(source.yearRangeId ?? null);
    const authorValue = source.authorQuery?.trim() ?? '';
    this.authorFilterEnabled.set(!!authorValue);
    this.authorText.set(authorValue);
    const publisherValue = source.publisherQuery?.trim() ?? '';
    this.publisherFilterEnabled.set(!!publisherValue);
    this.publisherText.set(publisherValue);
  }

  private cloneFilters(source: HomeFilterState): HomeFilterState {
    return {
      categories: [...source.categories],
      yearRangeId: source.yearRangeId ?? null,
      authorQuery: source.authorQuery?.trim() ? source.authorQuery?.trim() ?? null : null,
      publisherQuery: source.publisherQuery?.trim() ? source.publisherQuery?.trim() ?? null : null,
    };
  }

  private filtersEqual(a: HomeFilterState, b: HomeFilterState): boolean {
    return this.arraysEqual(a.categories, b.categories)
      && (a.yearRangeId ?? null) === (b.yearRangeId ?? null)
      && (a.authorQuery?.trim() ?? '') === (b.authorQuery?.trim() ?? '')
      && (a.publisherQuery?.trim() ?? '') === (b.publisherQuery?.trim() ?? '');
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((value, index) => value === b[index]);
  }

  private toggleValue(list: Category[], value: Category): Category[] {
    if (!value) {
      return list;
    }
    return list.includes(value) ? [] : [value];
  }
}
