import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface UserInfo {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  role: string;
  avatar: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken?: string;
    user: UserInfo;
  };
}

/**
 * AuthService — Tuần 7: Mở rộng Signals
 *
 * Tuần 6: signal + computed cơ bản (currentUser, isLoggedIn)
 * Tuần 7: Thêm:
 *   - isAdmin = computed()     → phân quyền dựa trên role
 *   - displayName = computed() → tên hiển thị rút gọn
 *   - effect()                 → tự đồng bộ state với localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5188/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  // Signal: thông tin user hiện tại (reactive)
  private _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());

  // Computed: kiểm tra trạng thái đăng nhập
  isLoggedIn = computed(() => this._currentUser() !== null && !!this.getToken());

  // Public readonly signal để các component theo dõi
  currentUser = this._currentUser.asReadonly();

  // === Tuần 7: Computed signals mở rộng ===

  /**
   * computed() — Kiểm tra user có phải admin không
   * Dùng để phân quyền hiển thị menu/chức năng admin
   */
  isAdmin = computed(() => this._currentUser()?.role === 'admin');

  /**
   * computed() — Tên hiển thị rút gọn (lấy tên cuối)
   * "Nguyễn Bảo Hân" → "Hân"
   */
  displayName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    const parts = user.fullName.trim().split(' ');
    return parts[parts.length - 1];
  });

  /**
   * computed() — Tên phòng ban + chức vụ
   * "Phòng Kỹ Thuật - Nhân Viên"
   */
  userPosition = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return `${user.departmentName} - ${user.positionName}`;
  });

  constructor(private http: HttpClient, private router: Router) {
    /**
     * effect() — Tuần 7: Tự đồng bộ state với localStorage
     * Khi _currentUser thay đổi → tự động cập nhật localStorage
     * Không cần gọi localStorage.setItem ở mỗi nơi nữa
     */
    effect(() => {
      const user = this._currentUser();
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
      }
    });
  }

  /**
   * Đăng nhập — gọi POST /api/auth/login, lưu token + user info
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Lưu token vào localStorage
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          }
          // Cập nhật signal → effect() sẽ tự đồng bộ user vào localStorage
          this._currentUser.set(response.data.user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Đăng xuất — xóa token, reset state, redirect về login
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Set null → effect() sẽ tự xóa user khỏi localStorage
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Lấy JWT token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshTokenApi(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error("No refresh token"));

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
        }
      })
    );
  }

  /**
   * Load thông tin user từ localStorage khi khởi động app
   */
  private loadUserFromStorage(): UserInfo | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
// Hotfix: �? v� l?i b?o m?t kh?n c?p
