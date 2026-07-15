import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0527 0%, #1a0a5e 50%, #4318ff 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-page::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(123, 97, 255, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .login-page::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(67, 24, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 40px 36px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-brand-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #4318ff 0%, #7b61ff 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(67, 24, 255, 0.35);
    }

    .login-brand-icon .material-icons-round {
      font-size: 1.8rem;
      color: white;
    }

    .login-brand h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .login-brand p {
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 400;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper .material-icons-round {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.15rem;
      color: #94a3b8;
      transition: 0.25s ease;
    }

    .input-wrapper input {
      width: 100%;
      padding: 12px 14px 12px 44px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      transition: 0.25s ease;
      background: #f8fafc;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: #4318ff;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.12);
      background: #ffffff;
    }

    .pwd-toggle {
      position: absolute !important;
      left: auto !important;
      right: 14px !important;
      cursor: pointer;
      pointer-events: auto !important;
    }
    
    .pwd-toggle:hover {
      color: #4318ff !important;
    }

    .input-wrapper input:focus + .material-icons-round,
    .input-wrapper input:focus ~ .material-icons-round {
      color: #4318ff;
    }

    .login-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4318ff 0%, #7b61ff 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: 0.25s ease;
      box-shadow: 0 4px 16px rgba(67, 24, 255, 0.3);
      margin-top: 8px;
    }

    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(67, 24, 255, 0.4);
    }

    .login-btn:active {
      transform: translateY(0);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      color: #ef4444;
      font-size: 0.82rem;
      font-weight: 500;
      margin-bottom: 20px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .login-error .material-icons-round {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .login-hint {
      margin-top: 24px;
      padding: 14px 16px;
      background: rgba(67, 24, 255, 0.05);
      border: 1px solid rgba(67, 24, 255, 0.12);
      border-radius: 10px;
      font-size: 0.78rem;
      color: #64748b;
      line-height: 1.6;
    }

    .login-hint strong {
      color: #4318ff;
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .login-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }

    .login-link {
      font-size: 0.82rem;
      color: #4318ff;
      text-decoration: none;
      font-weight: 500;
      transition: 0.2s;
    }

    .login-link:hover {
      text-decoration: underline;
      opacity: 0.85;
    }

    .login-link-divider {
      color: #cbd5e1;
      font-size: 0.75rem;
    }
  `],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-brand-icon">
            <span class="material-icons-round">fingerprint</span>
          </div>
          <h1>AttendPro</h1>
          <p>Đăng nhập hệ thống chấm công</p>
        </div>

        @if (errorMessage()) {
          <div class="login-error">
            <span class="material-icons-round">error</span>
            {{ errorMessage() }}
          </div>
        }

        <div class="form-group">
          <label>Tên đăng nhập</label>
          <div class="input-wrapper">
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              [(ngModel)]="username"
              (keyup.enter)="login()"
            />
            <span class="material-icons-round" style="pointer-events: none;">person</span>
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrapper">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="Nhập mật khẩu"
              [(ngModel)]="password"
              (keyup.enter)="login()"
              style="padding-right: 44px;"
            />
            <span class="material-icons-round" style="pointer-events: none;">lock</span>
            <span class="material-icons-round pwd-toggle" (click)="togglePassword()">
              {{ showPassword() ? 'visibility_off' : 'visibility' }}
            </span>
          </div>
        </div>

        <button class="login-btn" (click)="login()" [disabled]="isLoading()">
          @if (isLoading()) {
            <span class="material-icons-round" style="animation: spin 1s linear infinite;">refresh</span>
            Đang đăng nhập...
          } @else {
            <span class="material-icons-round">login</span>
            Đăng nhập
          }
        </button>

        <div class="login-links">
          <a class="login-link" routerLink="/forgot-password">Quên mật khẩu?</a>
          <span class="login-link-divider">|</span>
          <a class="login-link" routerLink="/register">Đăng ký tài khoản</a>
        </div>

        <div class="login-footer">
          © 2026 AttendPro - Attendance Management System
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Nếu đã login rồi → redirect về dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.errorMessage.set('');

    // Validate
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    this.isLoading.set(true);

    // Tuần 6: Gọi API thật thay vì mock setTimeout
    this.authService.login(this.username.trim(), this.password).subscribe({
      next: () => {
        // Login thành công → redirect về trang trước hoặc dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage.set('Tên đăng nhập hoặc mật khẩu không đúng.');
        } else if (err.status === 0) {
          this.errorMessage.set('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
        } else {
          this.errorMessage.set('Đăng nhập thất bại. Vui lòng thử lại.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
