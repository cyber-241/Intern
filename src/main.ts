import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

/**
 * Bootstrap Application - Week 5
 * - provideRouter: Cấu hình routing với Lazy Loading
 * - provideHttpClient + withInterceptors: Đăng ký Auth Interceptor
 *   → Tự động gắn Bearer token vào mọi HTTP request
 *   → Xử lý lỗi 401 redirect về login
 */
bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
}).catch(err => console.error(err));