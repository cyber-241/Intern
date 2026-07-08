import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth Interceptor (Week 5 - Angular Interceptor)
 * - Tự động gắn header Authorization: Bearer <token> vào mỗi request
 * - Xử lý lỗi 401 Unauthorized → redirect về login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Lấy token từ localStorage
  const token = localStorage.getItem('auth_token');

  // Clone request và gắn thêm header Authorization nếu có token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gửi request và xử lý lỗi
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token hết hạn hoặc không hợp lệ → xóa token và redirect về login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
