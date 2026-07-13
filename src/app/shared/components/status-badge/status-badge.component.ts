import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getBadgeClass()" [ngStyle]="getBadgeStyle()">
      {{ status }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-block;
    }
    .status-badge.done {
      background: var(--success-bg, #d1fae5);
      color: var(--success, #059669);
    }
    .status-badge.todo {
      background: var(--danger-bg, #fee2e2);
      color: var(--danger, #dc2626);
    }
    .status-badge.doing {
      background: var(--info-bg, #dbeafe);
      color: var(--info, #2563eb);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getBadgeClass(): string {
    switch (this.status) {
      case 'Đúng giờ':
        return 'done';
      case 'Đi trễ':
        return 'todo';
      case 'Đang làm việc':
        return 'doing';
      default:
        return '';
    }
  }

  getBadgeStyle(): any {
    if (this.status === 'Đang làm việc') {
      return { 'background': 'var(--info-bg)', 'color': 'var(--info)' };
    }
    return {};
  }
}
