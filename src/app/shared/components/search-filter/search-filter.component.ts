import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-filter-container">
      <div class="search-box">
        <span class="material-icons-round">search</span>
        <input
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
        />
      </div>
      
      @if (filterOptions.length > 0) {
        <select 
          class="filter-select" 
          [(ngModel)]="selectedFilter" 
          (ngModelChange)="onFilterChange($event)"
        >
          <option value="all">{{ allOptionLabel }}</option>
          @for (option of filterOptions; track option.value) {
            <option [value]="option.value">
              {{ option.label }}
            </option>
          }
        </select>
      }
    </div>
  `,
  styles: [`
    .search-filter-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box .material-icons-round {
      position: absolute;
      left: 12px;
      color: var(--text-muted);
      font-size: 1.2rem;
    }
    .search-box input {
      padding: 8px 16px 8px 38px;
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
      font-size: 0.9rem;
      transition: all 0.2s;
      width: 250px;
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .search-box input:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .filter-select {
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
      font-size: 0.9rem;
      background: var(--bg-card);
      color: var(--text-primary);
      cursor: pointer;
      min-width: 150px;
      transition: all 0.2s;
    }
    .filter-select:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
  `]
})
export class SearchFilterComponent implements OnInit {
  @Input() placeholder: string = 'Tìm kiếm...';
  @Input() filterOptions: FilterOption[] = [];
  @Input() allOptionLabel: string = 'Tất cả trạng thái';
  @Input() initialSearchQuery: string = '';
  @Input() initialFilterValue: string | number = 'all';

  @Output() searchChanged = new EventEmitter<string>();
  @Output() filterChanged = new EventEmitter<string | number>();

  searchQuery: string = '';
  selectedFilter: string | number = 'all';

  ngOnInit() {
    this.searchQuery = this.initialSearchQuery;
    this.selectedFilter = this.initialFilterValue;
  }

  onSearchChange(value: string) {
    this.searchChanged.emit(value);
  }

  onFilterChange(value: string | number) {
    this.filterChanged.emit(value);
  }
}
