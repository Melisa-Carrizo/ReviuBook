import { Component, EventEmitter, Input, Output } from '@angular/core';

type Status = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css'],
})
export class FilterPanelComponent {
  @Input() text = '';
  @Input() textPlaceholder = 'Buscar';
  @Input() status: Status = 'all';
  @Input() statusLabel = 'Estado';
  @Input() applyLabel = 'Aplicar filtros';

  @Output() textChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<Status>();
  @Output() apply = new EventEmitter<void>();

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
}
