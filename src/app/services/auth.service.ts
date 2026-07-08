import { Injectable, signal, computed } from '@angular/core';
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
    user: UserInfo;
  };
}

/**
 * AuthService — Tuần 6: Authentication Flow
 * Quản lý toàn bộ vòng đời xác thực: login, logout, lấy thông tin user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5188/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  // Signal: thông tin user hiện tại (reactive)
  private _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());

  // Computed: kiểm tra trạng thái đăng nhập
  isLoggedIn = computed(() => this._currentUser() !== null && !!this.getToken());

  // Public readonly signal để các component theo dõi
  currentUser = this._currentUser.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Đăng nhập — gọi POST /api/auth/login, lưu token + user info
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Lưu token và user info vào localStorage
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          // Cập nhật signal
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
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Lấy JWT token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
