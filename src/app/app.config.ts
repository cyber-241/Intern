import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

/**
 * App Config — Tuần 6: Đăng ký Auth Interceptor + Error Interceptor
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Thứ tự interceptor quan trọng: auth trước (gắn token), error sau (bắt lỗi)
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
