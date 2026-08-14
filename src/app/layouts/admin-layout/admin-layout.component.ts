import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Admin Layout — Tuần 14: Role-Based Menu + Responsive Mobile
 * Layout chính cho các trang sau khi đăng nhập
 * Sidebar dark (gradient tím/đen) chứa menu navigation (ẩn/hiện theo role)
 * Topbar chứa thông tin user + clock
 * Mobile: Sidebar overlay + backdrop
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  template: `
    <div class="admin-layout" [class.mobile-sidebar-open]="mobileSidebarOpen()">
      <!-- ===== SIDEBAR ===== -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <span class="material-icons-round">fingerprint</span>
          </div>
          @if (!sidebarCollapsed()) {
            <div class="brand-text">
              SimpleERP
              <small>Hệ thống quản lý</small>
            </div>
          }
        </div>

        <!-- Profile Section -->
        @if (!sidebarCollapsed()) {
          <div class="profile-section">
            <div class="avatar">{{ userInitials() }}</div>
            <h2>{{ authService.currentUser()?.fullName ?? 'Người dùng' }}</h2>
            <p>{{ authService.userPosition() }}</p>
            <span class="badge">{{ authService.currentUser()?.role?.toUpperCase() ?? 'USER' }}</span>
          </div>
        }

        <!-- Navigation Menu -->
        <div class="nav-label">MENU CHÍNH</div>
        <nav class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="material-icons-round">dashboard</span>
            @if (!sidebarCollapsed()) { <span>Dashboard</span> }
          </a>

          <!-- Tuần 14: Menu quản trị — Chỉ Admin -->
          @if (authService.isAdmin()) {
            <a routerLink="/employee" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">people</span>
              @if (!sidebarCollapsed()) { <span>Quản lý nhân viên</span> }
            </a>
            <a routerLink="/attendance" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">event_available</span>
              @if (!sidebarCollapsed()) { <span>Chấm công</span> }
            </a>
            <a routerLink="/department" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">domain</span>
              @if (!sidebarCollapsed()) { <span>Phòng ban</span> }
            </a>
            <a routerLink="/asset" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">inventory_2</span>
              @if (!sidebarCollapsed()) { <span>Tài sản</span> }
            </a>
            <a routerLink="/asset-category" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">category</span>
              @if (!sidebarCollapsed()) { <span>Danh mục TS</span> }
            </a>
          }

          <!-- Tuần 14: Duyệt yêu cầu — Admin + Manager -->
          @if (authService.isManagerOrAdmin()) {
            <a routerLink="/request-approval" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">rule</span>
              @if (!sidebarCollapsed()) { <span>Duyệt yêu cầu</span> }
            </a>
          }

          <!-- Tuần 14: Lịch sử chấm công — Employee + Manager (không phải Admin) -->
          @if (!authService.isAdmin()) {
            <a routerLink="/history" routerLinkActive="active" (click)="closeMobileSidebar()">
              <span class="material-icons-round">history</span>
              @if (!sidebarCollapsed()) { <span>Lịch sử chấm công</span> }
            </a>
          }

          <!-- Yêu cầu của tôi — Tất cả user -->
          <a routerLink="/my-requests" routerLinkActive="active" (click)="closeMobileSidebar()">
            <span class="material-icons-round">assignment</span>
            @if (!sidebarCollapsed()) { <span>Yêu cầu của tôi</span> }
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <span class="material-icons-round">verified</span>
          @if (!sidebarCollapsed()) {
            <span>SimpleERP v1.0.0 — Release</span>
          }
        </div>
      </aside>

      <!-- ===== MAIN CONTENT ===== -->
      <main class="main-content">
        <!-- Topbar -->
        <header class="top-header">
          <div class="header-left">
            <button class="btn-icon sidebar-toggle" (click)="toggleSidebar()" title="Thu gọn menu">
              <span class="material-icons-round">{{ sidebarCollapsed() ? 'menu_open' : 'menu' }}</span>
            </button>
            <div class="header-clock">
              <span class="material-icons-round">schedule</span>
              {{ currentTimeStr() }}
            </div>
            <div class="header-date">
              {{ currentDateStr() }}
            </div>
          </div>

          <div class="header-right">
            <button class="btn-icon" title="Thông báo">
              <span class="material-icons-round">notifications_none</span>
              <span class="notification-dot"></span>
            </button>
            <div class="header-user" (click)="toggleUserMenu()">
              <div class="header-avatar">{{ userInitials() }}</div>
              <div class="header-user-info">
                <span class="header-user-name">{{ authService.displayName() }}</span>
                <span class="header-user-role">{{ authService.currentUser()?.role ?? '' }}</span>
              </div>
              <span class="material-icons-round header-user-arrow">expand_more</span>
            </div>
            @if (userMenuOpen) {
              <div class="user-dropdown">
                <div class="user-dropdown-header">
                  <div class="header-avatar" style="width: 40px; height: 40px; font-size: 0.85rem;">{{ userInitials() }}</div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-primary);">{{ authService.currentUser()?.fullName ?? 'Người dùng' }}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">{{ authService.currentUser()?.employeeCode ?? '' }}</div>
                  </div>
                </div>
                <div class="user-dropdown-divider"></div>
                <a class="user-dropdown-item" routerLink="/dashboard" (click)="userMenuOpen = false">
                  <span class="material-icons-round">person</span>
                  Hồ sơ cá nhân
                </a>
                <a class="user-dropdown-item" (click)="openChangePasswordModal(); userMenuOpen = false">
                  <span class="material-icons-round">settings</span>
                  Đổi mật khẩu
                </a>
                <div class="user-dropdown-divider"></div>
                <a class="user-dropdown-item logout" (click)="logout()">
                  <span class="material-icons-round">logout</span>
                  Đăng xuất
                </a>
              </div>
            }
          </div>
        </header>

        <!-- Page Content -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>

        <!-- Footer -->
        <footer class="app-footer">
          <div class="footer-top">
            <div class="footer-brand-section">
              <div class="footer-brand-logos">
                <div class="footer-brand-logo">
                  <span class="material-icons-round" style="color: var(--primary);">business</span>
                  <span>SimpleERP Co.</span>
                </div>
                <div class="footer-brand-logo">
                  <span class="material-icons-round" style="color: #ff9800;">fingerprint</span>
                  <span>SimpleERP Chấm công</span>
                </div>
              </div>
            </div>
          </div>
          <div class="footer-main">
            <div class="footer-col footer-col-large">
              <h4 class="footer-heading">CÔNG TY CỔ PHẦN GIẢI PHÁP GIÁO DỤC ASC</h4>
              <p class="footer-text">2 Nguyễn Thế Lộc, Phường Bảy Hiền, Thành phố Hồ Chí Minh, Việt Nam</p>
              <p class="footer-text">Thời gian làm việc: 8h - 17h30, thứ 2 - thứ 6</p>
            </div>
            <div class="footer-col">
              <h4 class="footer-heading">Công ty</h4>
              <a href="#" class="footer-link">Về SimpleERP</a>
              <a href="#" class="footer-link">Tin tức</a>
              <a href="#" class="footer-link">Tuyển dụng</a>
              <a href="#" class="footer-link">Hợp tác</a>
              <a href="#" class="footer-link">Liên hệ</a>
              <a href="#" class="footer-link">Chính sách bảo mật</a>
              <a href="#" class="footer-link">Thông tin thanh toán</a>
            </div>
            <div class="footer-col">
              <h4 class="footer-heading">Liên kết</h4>
              <a href="#" class="footer-link">Facebook</a>
              <a href="#" class="footer-link">Youtube</a>
              <a href="#" class="footer-link">LinkedIn</a>
              <a href="#" class="footer-link">Zalo</a>
              <a href="#" class="footer-link">Tiktok</a>
            </div>
            <div class="footer-col">
              <h4 class="footer-heading">Blogs</h4>
              <a href="#" class="footer-link">Tài chính - Kế toán</a>
              <a href="#" class="footer-link">Quản trị nguồn nhân lực</a>
              <a href="#" class="footer-link">Marketing - Bán hàng</a>
              <a href="#" class="footer-link">Quản lý - Điều hành</a>
              <a href="#" class="footer-link">Kinh doanh bán lẻ</a>
              <a href="#" class="footer-link">AI & Data</a>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="footer-bottom-left">
              <div class="footer-apps">
                <button class="footer-btn-app"><span class="material-icons-round">apple</span> App Store</button>
                <button class="footer-btn-app"><span class="material-icons-round">android</span> Google Play</button>
              </div>
            </div>
            <div class="footer-bottom-right">
              <span class="footer-version"><span class="material-icons-round">verified</span> v1.0.0 — Release</span>
            </div>
          </div>
        </footer>
      </main>
    </div>

    <!-- Backdrop for user menu -->
    @if (userMenuOpen) {
      <div class="user-menu-backdrop" (click)="userMenuOpen = false"></div>
    }

    <!-- Tuần 14: Backdrop cho mobile sidebar overlay -->
    @if (mobileSidebarOpen()) {
      <div class="mobile-sidebar-backdrop" (click)="closeMobileSidebar()"></div>
    }

    <!-- Change Password Modal -->
    @if (showChangePasswordModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <h3>Đổi mật khẩu</h3>
            <button class="btn-close" (click)="closeChangePasswordModal()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <form [formGroup]="changePasswordForm" (ngSubmit)="onChangePasswordSubmit()">
            <div class="modal-body">
              @if (passwordError) {
                <div class="alert alert-danger mb-3">
                  {{ passwordError }}
                </div>
              }

              <div class="mb-3">
                <label>Mật khẩu cũ (*)</label>
                <input type="password" formControlName="oldPassword" class="form-control" placeholder="Nhập mật khẩu hiện tại">
                @if (changePasswordForm.get('oldPassword')?.invalid && changePasswordForm.get('oldPassword')?.touched) {
                  <div class="error-message">Vui lòng nhập mật khẩu cũ.</div>
                }
              </div>

              <div class="mb-3">
                <label>Mật khẩu mới (*)</label>
                <input type="password" formControlName="newPassword" class="form-control" placeholder="Nhập mật khẩu mới">
                @if (changePasswordForm.get('newPassword')?.invalid && changePasswordForm.get('newPassword')?.touched) {
                  <div class="error-message">Mật khẩu mới phải từ 6 ký tự.</div>
                }
              </div>

              <div class="mb-3">
                <label>Xác nhận mật khẩu mới (*)</label>
                <input type="password" formControlName="confirmPassword" class="form-control" placeholder="Xác nhận mật khẩu mới">
                @if (changePasswordForm.get('confirmPassword')?.invalid && changePasswordForm.get('confirmPassword')?.touched) {
                  <div class="error-message">Vui lòng xác nhận mật khẩu.</div>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeChangePasswordModal()">Hủy</button>
              <button type="submit" class="btn-primary" [disabled]="changePasswordForm.invalid">Đổi mật khẩu</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styleUrls: ['../../app.css'],
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-main);
    }

    /* ===== Sidebar ===== */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: linear-gradient(180deg, var(--sidebar-start) 0%, var(--sidebar-end) 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed {
      width: 72px;
      min-width: 72px;
    }
    .sidebar.collapsed .sidebar-brand {
      padding: 20px 16px;
      justify-content: center;
    }
    .sidebar.collapsed .nav-menu a {
      justify-content: center;
      padding: 12px;
    }
    .sidebar.collapsed .nav-label {
      text-align: center;
      padding: 16px 8px 8px;
      font-size: 0;
    }
    .sidebar.collapsed .nav-label::after {
      content: '•••';
      font-size: 0.7rem;
      color: rgba(255,255,255,0.3);
    }
    .sidebar.collapsed .sidebar-footer {
      justify-content: center;
    }

    /* ===== Main Content ===== */
    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed ~ .main-content {
      margin-left: 72px;
    }

    /* ===== Topbar ===== */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 28px;
      background: rgba(255, 255, 255, 0.9);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sidebar-toggle {
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--text-secondary);
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .sidebar-toggle:hover {
      background: var(--bg-hover);
      color: var(--primary);
    }

    .header-date {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* ===== Content Area ===== */
    .content-area {
      flex: 1;
      padding: 28px;
    }

    /* ===== Tuần 14: Mobile Sidebar Backdrop ===== */
    .mobile-sidebar-backdrop {
      display: none;
    }

    /* ===== Responsive ===== */
    @media (max-width: 1024px) {
      .sidebar {
        width: 72px;
        min-width: 72px;
      }
      .sidebar .brand-text,
      .sidebar .profile-section,
      .sidebar .nav-menu a span:not(.material-icons-round),
      .sidebar .sidebar-footer span:not(.material-icons-round) {
        display: none;
      }
      .sidebar .sidebar-brand { padding: 20px 16px; justify-content: center; }
      .sidebar .nav-menu a { justify-content: center; padding: 12px; }
      .sidebar .nav-label { font-size: 0; text-align: center; padding: 16px 8px 8px; }
      .sidebar .nav-label::after { content: '•••'; font-size: 0.7rem; color: rgba(255,255,255,0.3); }
      .sidebar .sidebar-footer { justify-content: center; }
      .main-content { margin-left: 72px; }
    }

    /* Tuần 14: Mobile — Sidebar overlay (≤768px) */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -280px;
        width: 260px;
        min-width: 260px;
        z-index: 200;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sidebar .brand-text,
      .sidebar .profile-section,
      .sidebar .nav-menu a span:not(.material-icons-round),
      .sidebar .sidebar-footer span:not(.material-icons-round) {
        display: unset;
      }
      .sidebar .sidebar-brand { padding: 24px 20px; justify-content: flex-start; }
      .sidebar .nav-menu a { justify-content: flex-start; padding: 12px 20px; }
      .sidebar .nav-label { font-size: 0.65rem; text-align: left; padding: 16px 20px 8px; }
      .sidebar .nav-label::after { content: none; }
      .sidebar .sidebar-footer { justify-content: flex-start; }

      .mobile-sidebar-open .sidebar {
        left: 0;
      }
      .mobile-sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 150;
        backdrop-filter: blur(2px);
      }
      .main-content {
        margin-left: 0 !important;
      }
      .sidebar.collapsed ~ .main-content {
        margin-left: 0;
      }
      .content-area { padding: 16px; }
      .top-header { padding: 12px 16px; }
      .header-date { display: none; }
      .header-clock { display: none; }
      .header-user-info { display: none; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  fb = inject(FormBuilder);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false); // Tuần 14: Mobile sidebar overlay state
  currentTimeStr = signal('');
  currentDateStr = signal('');
  userMenuOpen = false;
  private timerInterval: any;

  // Change Password Modal
  showChangePasswordModal = false;
  passwordError = '';
  changePasswordForm: FormGroup = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  userInitials = computed(() => {
    const name = this.authService.currentUser()?.fullName ?? 'U';
    return name.substring(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    this.updateDateTime();
    this.timerInterval = setInterval(() => this.updateDateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentTimeStr.set(now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));

    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    this.currentDateStr.set(`${dayName}, ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`);
  }

  toggleSidebar(): void {
    // Tuần 14: Trên mobile (≤768px) toggle overlay, trên desktop toggle collapsed
    if (window.innerWidth <= 768) {
      this.mobileSidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  /** Tuần 14: Đóng mobile sidebar khi chọn menu item */
  closeMobileSidebar(): void {
    if (window.innerWidth <= 768) {
      this.mobileSidebarOpen.set(false);
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
  }

  // Change Password Methods
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordError = '';
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        if (res.success) {
          this.notificationService.success('Đổi mật khẩu thành công');
          this.closeChangePasswordModal();
        }
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Đổi mật khẩu thất bại.';
      }
    });
  }
}
