import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { NotificationService, Notification } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  // Tuần 6: Lấy thông tin user từ AuthService (reactive signal)
  currentUser = computed(() => this.authService.currentUser());
  
  // Tuần 8: Expose isAdmin
  isAdmin = computed(() => this.authService.isAdmin());

  currentTimeStr = signal<string>('');
  currentDateStr = signal<string>('');
  userMenuOpen: boolean = false;
  private timerInterval: any;

  // Tuần 6: Toast notifications
  notifications = computed(() => this.notificationService.notifications());

  // Change Password state
  showChangePasswordModal = false;
  changePasswordForm: FormGroup;
  passwordError = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

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

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout(); // Tuần 6: dùng AuthService thay vì xóa localStorage thủ công
  }

  dismissToast(id: number): void {
    this.notificationService.dismiss(id);
  }

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