import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Status = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css'],
})
export class FilterPanelComponent {
  @Input() text = '';
  @Input() textPlaceholder = 'Buscar';
  @Input() status: Status = 'all';
  @Input() statusLabel = 'Estado';
  @Input() applyLabel = 'Aplicar filtros';

  @Input() secondaryText = '';
  @Input() secondaryPlaceholder = '';
  @Input() secondaryLabel = '';

  @Input() category = '';
  @Input() categoryLabel = 'Categoría';
  @Input() categoryOptions: string[] = [];

  @Output() textChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<Status>();
  @Output() apply = new EventEmitter<void>();
  @Output() secondaryTextChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  onTextChange(value: string | null) {
    this.textChange.emit(value ?? '');
  }

  onStatusChange(value: string | null) {
    const v: Status = value === 'active' ? 'active' : value === 'inactive' ? 'inactive' : 'all';
    this.statusChange.emit(v);
  }

  onApply() {
    this.apply.emit();
  }

  onSecondaryTextChange(value: string | null) {
    this.secondaryTextChange.emit(value ?? '');
  }

  onCategoryChange(value: string | null) {
    this.categoryChange.emit(value ?? '');
  }

  formatCategory(option: string): string {
    if (!option) return '';
    // replace underscores with spaces, lowercase then capitalize each word
    return option
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
