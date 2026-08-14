import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

/**
 * App Routes — Tuần 14: Thêm data.roles cho phân quyền multi-role
 * Guard sẽ đọc data.roles để xác định role nào được phép truy cập.
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
        canActivate: [adminGuard],
        data: { roles: ['admin'] }  // Tuần 14: Chỉ admin
      },
      {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance.component').then(c => c.AttendanceComponent),
        title: 'Chấm công',
        canActivate: [adminGuard],
        data: { roles: ['admin'] }  // Tuần 14: Chỉ admin
      },
      {
        path: 'department',
        loadComponent: () => import('./pages/department/department.component').then(c => c.DepartmentComponent),
        title: 'Phòng ban',
        canActivate: [adminGuard],
        data: { roles: ['admin'] }  // Tuần 14: Chỉ admin
      },
      {
        path: 'asset',
        loadComponent: () => import('./pages/asset/asset.component').then(c => c.AssetComponent),
        title: 'Tài sản',
        canActivate: [adminGuard],
        data: { roles: ['admin'] }  // Tuần 14: Chỉ admin
      },
      {
        path: 'asset-category',
        loadComponent: () => import('./pages/asset-category/asset-category.component').then(c => c.AssetCategoryComponent),
        title: 'Danh mục tài sản',
        canActivate: [adminGuard],
        data: { roles: ['admin'] }  // Tuần 14: Chỉ admin
      },
      {
        path: 'my-requests',
        loadComponent: () => import('./pages/my-requests/my-requests').then(c => c.MyRequests),
        title: 'Yêu cầu của tôi'
      },
      {
        path: 'request-approval',
        loadComponent: () => import('./pages/request-approval/request-approval').then(c => c.RequestApproval),
        title: 'Duyệt yêu cầu',
        canActivate: [adminGuard],
        data: { roles: ['admin', 'manager'] }  // Tuần 14: Admin + Manager duyệt
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];