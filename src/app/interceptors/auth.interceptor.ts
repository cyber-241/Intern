import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
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
      // Lỗi 401 sẽ được xử lý bởi errorInterceptor
      return throwError(() => error);
    })
  );
};
