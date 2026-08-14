import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  styles: [`
    .forgot-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0527 0%, #1a0a5e 50%, #4318ff 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .forgot-page::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(123, 97, 255, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .forgot-card {
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

    .forgot-brand {
      text-align: center;
      margin-bottom: 28px;
    }

    .forgot-brand-icon {
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

    .forgot-brand-icon .material-icons-round { font-size: 1.8rem; color: white; }

    .forgot-brand h1 { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
    .forgot-brand p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #1e293b; margin-bottom: 7px; }

    .input-wrapper { position: relative; }
    .input-wrapper .material-icons-round {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      font-size: 1.15rem; color: #94a3b8; pointer-events: none;
    }
    .input-wrapper input {
      width: 100%; padding: 12px 14px 12px 44px;
      border: 2px solid #e2e8f0; border-radius: 12px;
      font-size: 0.9rem; font-family: 'Inter', sans-serif; color: #1e293b;
      transition: 0.25s ease; background: #f8fafc;
    }
    .input-wrapper input:focus {
      outline: none; border-color: #4318ff;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.12); background: white;
    }

    .forgot-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #4318ff 0%, #7b61ff 100%);
      color: white; border: none; border-radius: 12px;
      font-size: 0.95rem; font-weight: 700; font-family: 'Inter', sans-serif;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: 0.25s ease; box-shadow: 0 4px 16px rgba(67, 24, 255, 0.3); margin-top: 8px;
    }
    .forgot-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(67, 24, 255, 0.4); }
    .forgot-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .msg-error {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px;
      color: #ef4444; font-size: 0.82rem; font-weight: 500;
      margin-bottom: 16px; animation: fadeIn 0.3s ease;
    }
    .msg-success {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 10px;
      color: #16a34a; font-size: 0.82rem; font-weight: 500;
      margin-bottom: 16px; animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .login-links { display: flex; justify-content: center; gap: 8px; margin-top: 24px; }
    .login-link { font-size: 0.82rem; color: #4318ff; text-decoration: none; font-weight: 500; }
    .login-link:hover { text-decoration: underline; }

    .forgot-footer { text-align: center; margin-top: 20px; font-size: 0.75rem; color: #94a3b8; }
  `],
  template: `
    <div class="forgot-page">
      <div class="forgot-card">
        <div class="forgot-brand">
          <div class="forgot-brand-icon">
            <span class="material-icons-round">lock_reset</span>
          </div>
          <h1>Quên mật khẩu</h1>
          <p>Nhập tên đăng nhập và mật khẩu mới để đặt lại</p>
        </div>

        @if (errorMessage()) {
          <div class="msg-error">
            <span class="material-icons-round" style="font-size:1.1rem;flex-shrink:0;">error</span>
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="msg-success">
            <span class="material-icons-round" style="font-size:1.1rem;flex-shrink:0;">check_circle</span>
            {{ successMessage() }}
          </div>
        }

        <div class="form-group">
          <label>Tên đăng nhập</label>
          <div class="input-wrapper">
            <input type="text" placeholder="Nhập tên đăng nhập" [(ngModel)]="username" />
            <span class="material-icons-round">person</span>
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)" [(ngModel)]="newPassword" />
            <span class="material-icons-round">lock</span>
          </div>
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Nhập lại mật khẩu mới" [(ngModel)]="confirmPassword" (keyup.enter)="resetPassword()" />
            <span class="material-icons-round">lock</span>
          </div>
        </div>

        <button class="forgot-btn" (click)="resetPassword()" [disabled]="isLoading()">
          @if (isLoading()) {
            <span class="material-icons-round" style="animation: spin 1s linear infinite;">refresh</span>
            Đang xử lý...
          } @else {
            <span class="material-icons-round">lock_reset</span>
            Đặt lại mật khẩu
          }
        </button>

        <div class="login-links">
          <a class="login-link" routerLink="/login">← Quay lại đăng nhập</a>
        </div>

        <div class="forgot-footer">
          © 2026 AttendPro - Attendance Management System
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  username = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  resetPassword(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.username.trim()) {
      this.errorMessage.set('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.isLoading.set(true);

    this.http.post<any>('http://localhost:5188/api/auth/reset-password', {
      username: this.username.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage.set('Không tìm thấy tài khoản với tên đăng nhập này.');
        } else if (err.status === 0) {
          this.errorMessage.set('Không thể kết nối đến máy chủ.');
        } else {
          this.errorMessage.set(err.error?.message || 'Đặt lại mật khẩu thất bại.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
