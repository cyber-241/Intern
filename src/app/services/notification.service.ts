import { Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

/**
 * NotificationService — Tuần 6: Error Handling
 * Hiển thị toast notification thay thế các alert() thô
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  private nextId = 1;

  success(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.show({ type: 'info', message, duration });
  }

  private show(notification: Omit<Notification, 'id'>): void {
    const id = this.nextId++;
    this._notifications.update(list => [...list, { ...notification, id }]);

    // Tự động ẩn sau duration
    setTimeout(() => this.dismiss(id), notification.duration ?? 3000);
  }

  dismiss(id: number): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }
}
