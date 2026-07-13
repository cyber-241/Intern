import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

/**
 * App Routes - Week 6: Thêm Register + Forgot Password
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
    path: 'register',
    loadComponent: () =>
      import('./register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password.component').then(m => m.ForgotPasswordComponent)
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
    path: 'employee',
    loadComponent: () =>
      import('./employee.component').then(m => m.EmployeeComponent),
    canActivate: [authGuard] // Yêu cầu đăng nhập, thực tế tuần sau sẽ phân quyền admin
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];