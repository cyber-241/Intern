import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor — Tuần 6: Dùng AuthService để lấy token
 * Tự động gắn header Authorization: Bearer <token> vào mỗi request
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Lấy token từ AuthService
  const token = authService.getToken();

  // Clone request và gắn thêm header Authorization nếu có token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tuần 8: Xử lý Refresh Token khi gặp lỗi 401
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh-token')) {
        return authService.refreshTokenApi().pipe(
          switchMap((res) => {
            // Lấy token mới vừa lưu
            const newToken = authService.getToken();
            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            // Gửi lại request cũ với token mới
            return next(newAuthReq);
          }),
          catchError((refreshErr) => {
            // Nếu refresh cũng lỗi (hết hạn refresh token) -> Đăng xuất
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
