import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0527 0%, #1a0a5e 50%, #4318ff 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .register-page::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(123, 97, 255, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .register-card {
      width: 100%;
      max-width: 460px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 36px 36px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .register-brand {
      text-align: center;
      margin-bottom: 28px;
    }

    .register-brand-icon {
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

    .register-brand-icon .material-icons-round { font-size: 1.8rem; color: white; }

    .register-brand h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
    .register-brand p { font-size: 0.85rem; color: #94a3b8; }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .form-group {
      margin-bottom: 16px;
      flex: 1;
    }

    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper .material-icons-round {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      font-size: 1.15rem; color: #94a3b8; transition: 0.25s ease; pointer-events: none;
    }

    .input-wrapper input, .input-wrapper select {
      width: 100%;
      padding: 11px 14px 11px 44px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.88rem;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      transition: 0.25s ease;
      background: #f8fafc;
    }

    .input-wrapper input:focus, .input-wrapper select:focus {
      outline: none;
      border-color: #4318ff;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.12);
      background: white;
    }

    .register-btn {
      width: 100%;
      padding: 13px;
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

    .register-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(67, 24, 255, 0.4); }
    .register-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .register-error {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      color: #ef4444; font-size: 0.82rem; font-weight: 500;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    .register-success {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 10px;
      color: #16a34a; font-size: 0.82rem; font-weight: 500;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .login-links {
      display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px;
    }

    .login-link {
      font-size: 0.82rem; color: #4318ff; text-decoration: none; font-weight: 500; transition: 0.2s;
    }

    .login-link:hover { text-decoration: underline; }

    .register-footer {
      text-align: center; margin-top: 20px; font-size: 0.75rem; color: #94a3b8;
    }
  `],
  template: `
    <div class="register-page">
      <div class="register-card">
        <div class="register-brand">
          <div class="register-brand-icon">
            <span class="material-icons-round">person_add</span>
          </div>
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản mới để sử dụng hệ thống</p>
        </div>

        @if (errorMessage()) {
          <div class="register-error">
            <span class="material-icons-round" style="font-size:1.1rem;flex-shrink:0;">error</span>
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="register-success">
            <span class="material-icons-round" style="font-size:1.1rem;flex-shrink:0;">check_circle</span>
            {{ successMessage() }}
          </div>
        }

        <div class="form-group">
          <label>Họ và tên</label>
          <div class="input-wrapper">
            <input type="text" placeholder="Nhập họ và tên" [(ngModel)]="fullName" />
            <span class="material-icons-round">badge</span>
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <div class="input-wrapper">
            <input type="email" placeholder="Nhập email" [(ngModel)]="email" />
            <span class="material-icons-round">email</span>
          </div>
        </div>

        <div class="form-group">
          <label>Tên đăng nhập</label>
          <div class="input-wrapper">
            <input type="text" placeholder="Nhập tên đăng nhập" [(ngModel)]="username" />
            <span class="material-icons-round">person</span>
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" [(ngModel)]="password" />
            <span class="material-icons-round">lock</span>
          </div>
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Nhập lại mật khẩu" [(ngModel)]="confirmPassword" />
            <span class="material-icons-round">lock</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Phòng ban</label>
            <div class="input-wrapper">
              <select [(ngModel)]="departmentId">
                @for (dept of departments; track dept.departmentId) {
                  <option [value]="dept.departmentId">{{ dept.departmentName }}</option>
                }
              </select>
              <span class="material-icons-round">domain</span>
            </div>
          </div>
          <div class="form-group">
            <label>Chức vụ</label>
            <div class="input-wrapper">
              <select [(ngModel)]="positionId">
                <option [value]="5">Nhân Viên</option>
                <option [value]="4">Phó Phòng</option>
                <option [value]="3">Trưởng Phòng</option>
                <option [value]="2">Phó Giám Đốc</option>
                <option [value]="1">Giám Đốc</option>
              </select>
              <span class="material-icons-round">work</span>
            </div>
          </div>
        </div>

        <button class="register-btn" (click)="register()" [disabled]="isLoading()">
          @if (isLoading()) {
            <span class="material-icons-round" style="animation: spin 1s linear infinite;">refresh</span>
            Đang đăng ký...
          } @else {
            <span class="material-icons-round">person_add</span>
            Đăng ký
          }
        </button>

        <div class="login-links">
          Đã có tài khoản?
          <a class="login-link" routerLink="/login">Đăng nhập</a>
        </div>

        <div class="register-footer">
          © 2026 AttendPro - Attendance Management System
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  departmentId = 1;
  positionId = 5;
  departments: any[] = [];
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:5188/api/departments').subscribe({
      next: (res) => {
        if (res.success) {
          this.departments = res.data;
        }
      }
    });
  }

  register(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validate
    if (!this.fullName.trim() || !this.email.trim() || !this.username.trim() || !this.password) {
      this.errorMessage.set('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.isLoading.set(true);

    this.http.post<any>('http://localhost:5188/api/auth/register', {
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      username: this.username.trim(),
      password: this.password,
      departmentId: Number(this.departmentId),
      positionId: Number(this.positionId)
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage.set('Tên đăng nhập hoặc email đã tồn tại.');
        } else if (err.status === 0) {
          this.errorMessage.set('Không thể kết nối đến máy chủ.');
        } else {
          this.errorMessage.set(err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
