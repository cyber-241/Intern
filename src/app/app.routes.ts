import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

/**
 * App Routes - Week 11: Sử dụng AdminLayoutComponent
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
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('./employee.component').then(m => m.EmployeeComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance.component').then(c => c.AttendanceComponent),
        title: 'Chấm công',
        canActivate: [adminGuard]
      },
      {
        path: 'department',
        loadComponent: () => import('./pages/department/department.component').then(c => c.DepartmentComponent),
        title: 'Phòng ban',
        canActivate: [adminGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];