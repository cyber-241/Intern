import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * AdminGuard — Tuần 8: Bảo vệ route chỉ cho phép Admin truy cập
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isAdmin()) {
    return true;
  }

  // Nếu không phải Admin, thông báo và chặn lại, đẩy về dashboard
  notificationService.error('Bạn không có quyền truy cập vào chức năng này!');
  router.navigate(['/dashboard']);
  return false;
};
