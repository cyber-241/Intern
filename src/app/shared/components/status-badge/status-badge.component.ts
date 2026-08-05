import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [class]="getBadgeClass()">
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
    .status-badge.status-success {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
    }
    .status-badge.status-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .status-badge.status-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }
    .status-badge.status-info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .status-badge.status-default {
      background: var(--bg-main);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getBadgeClass(): string {
    switch (this.status) {
      case 'Đúng giờ':
      case 'Hoàn thành':
      case 'Đã duyệt':
      case 'Hoạt động':
      case 'Sẵn sàng':
        return 'status-success';
      case 'Đi trễ':
      case 'Nghỉ phép':
      case 'Từ chối':
      case 'Ngừng hoạt động':
      case 'Vắng mặt':
      case 'Thanh lý':
        return 'status-danger';
      case 'Đang làm việc':
      case 'Đang chờ':
      case 'Đang xử lý':
      case 'Đang sử dụng':
        return 'status-info';
      case 'Về sớm':
      case 'Tạm ngưng':
      case 'Cảnh báo':
      case 'Bảo trì':
        return 'status-warning';
      default:
        return 'status-default';
    }
  }
}
