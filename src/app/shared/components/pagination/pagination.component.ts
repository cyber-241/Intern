import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="pagination-container">
      <div class="pagination-info">
        Hiển thị {{ startIndex }} - {{ endIndex }} / {{ totalItems }} kết quả
      </div>
      <div class="pagination-controls">
        <button class="page-btn" [disabled]="currentPage === 1" (click)="onPageChange(1)" title="Trang đầu">
          <span class="material-icons-round">first_page</span>
        </button>
        <button class="page-btn" [disabled]="currentPage === 1" (click)="onPageChange(currentPage - 1)" title="Trang trước">
          <span class="material-icons-round">chevron_left</span>
        </button>
        
        @for (page of visiblePages; track page) {
          @if (page === -1) {
            <span class="page-dots">...</span>
          } @else {
            <button class="page-btn" [class.active]="currentPage === page" (click)="onPageChange(page)">
              {{ page }}
            </button>
          }
        }
        
        <button class="page-btn" [disabled]="currentPage === totalPages" (click)="onPageChange(currentPage + 1)" title="Trang sau">
          <span class="material-icons-round">chevron_right</span>
        </button>
        <button class="page-btn" [disabled]="currentPage === totalPages" (click)="onPageChange(totalPages)" title="Trang cuối">
          <span class="material-icons-round">last_page</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid var(--border-light);
      background: var(--bg-card);
      flex-wrap: wrap;
      gap: 12px;
    }
    .pagination-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .page-btn {
      min-width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-primary);
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0 8px;
    }
    .page-btn:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--primary-light);
      color: var(--primary);
    }
    .page-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 2px 8px var(--primary-glow);
    }
    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--bg-main);
    }
    .page-btn .material-icons-round {
      font-size: 1.1rem;
    }
    .page-dots {
      padding: 0 4px;
      color: var(--text-muted);
      font-weight: 600;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  
  @Output() pageChanged = new EventEmitter<number>();

  get startIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push(-1); // -1 represents dots
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.totalPages) {
        if (end < this.totalPages - 1) pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }
}
