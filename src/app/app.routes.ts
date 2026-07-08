import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * App Routes - Week 5: Lazy Loading + Auth Guard
 *
 * Lazy Loading: Dùng loadComponent() để tải component theo nhu cầu
 * → Giảm bundle size ban đầu, tăng tốc load trang
 *
 * Auth Guard: Bảo vệ các route yêu cầu đăng nhập
 * → Redirect về /login nếu chưa authenticated
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];