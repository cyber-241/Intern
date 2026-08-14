import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * AdminGuard — Tuần 14: Nâng cấp hỗ trợ multi-role
 *
 * Đọc `data.roles` từ route config để xác định role nào được phép truy cập.
 * Ví dụ: data: { roles: ['admin', 'manager'] } → cho phép cả admin lẫn manager.
 * Nếu không có data.roles → fallback chỉ cho admin (tương thích code cũ).
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Tuần 14: Lấy danh sách role được phép từ route data, mặc định chỉ admin
  const allowedRoles: string[] = route.data?.['roles'] || ['admin'];

  // Kiểm tra user hiện tại có nằm trong danh sách role được phép không
  const userRole = authService.currentUser()?.role?.toLowerCase()?.trim();
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Nếu không có quyền, thông báo và chặn lại, đẩy về dashboard
  notificationService.error('Bạn không có quyền truy cập vào chức năng này!');
  router.navigate(['/dashboard']);
  return false;
};
