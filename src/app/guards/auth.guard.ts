import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Auth Guard (Week 5 - Angular Guard)
 * Kiểm tra user đã đăng nhập chưa trước khi cho truy cập route
 * Nếu chưa login → redirect về /login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Kiểm tra token trong localStorage
  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    // Chưa đăng nhập → redirect về trang login
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
