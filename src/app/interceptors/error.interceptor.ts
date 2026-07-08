import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Error Interceptor — Tuần 6: Global Error Handling
 * Bắt tất cả lỗi HTTP và hiển thị thông báo thân thiện cho người dùng
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Bỏ qua lỗi cho các request login (sẽ tự xử lý ở component)
      const isLoginRequest = req.url.includes('/api/auth/login');

      switch (error.status) {
        case 0:
          // Không kết nối được server
          if (!isLoginRequest) {
            notificationService.error('❌ Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!');
          }
          break;

        case 400:
          // Bad Request — lỗi dữ liệu đầu vào
          if (!isLoginRequest) {
            const msg = error.error?.message ?? 'Dữ liệu không hợp lệ.';
            notificationService.error(`❌ ${msg}`);
          }
          break;

        case 401:
          // Unauthorized — hết phiên đăng nhập
          notificationService.warning('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          authService.logout();
          break;

        case 403:
          // Forbidden — không có quyền
          notificationService.error('🚫 Bạn không có quyền thực hiện thao tác này.');
          break;

        case 404:
          // Not Found
          if (!isLoginRequest) {
            notificationService.error('🔍 Không tìm thấy dữ liệu yêu cầu.');
          }
          break;

        case 500:
        case 502:
        case 503:
          // Server Error
          notificationService.error('🔥 Lỗi máy chủ. Vui lòng thử lại sau.');
          break;

        default:
          if (!isLoginRequest && error.status > 0) {
            notificationService.error(`❌ Đã xảy ra lỗi (${error.status}). Vui lòng thử lại.`);
          }
      }

      return throwError(() => error);
    })
  );
};
