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
 * AuthService â€” Tuáº§n 7: Má»Ÿ rá»™ng Signals
 *
 * Tuáº§n 6: signal + computed cÆ¡ báº£n (currentUser, isLoggedIn)
 * Tuáº§n 7: ThĂªm:
 *   - isAdmin = computed()     â†’ phĂ¢n quyá»n dá»±a trĂªn role
 *   - displayName = computed() â†’ tĂªn hiá»ƒn thá»‹ rĂºt gá»n
 *   - effect()                 â†’ tá»± Ä‘á»“ng bá»™ state vá»›i localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5188/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  // Signal: thĂ´ng tin user hiá»‡n táº¡i (reactive)
  private _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());

  // Computed: kiá»ƒm tra tráº¡ng thĂ¡i Ä‘Äƒng nháº­p
  isLoggedIn = computed(() => this._currentUser() !== null && !!this.getToken());

  // Public readonly signal Ä‘á»ƒ cĂ¡c component theo dĂµi
  currentUser = this._currentUser.asReadonly();

  // === Tuáº§n 7: Computed signals má»Ÿ rá»™ng ===

  /**
   * computed() â€” Kiá»ƒm tra user cĂ³ pháº£i admin khĂ´ng
   * DĂ¹ng Ä‘á»ƒ phĂ¢n quyá»n hiá»ƒn thá»‹ menu/chá»©c nÄƒng admin
   */
  isAdmin = computed(() => this._currentUser()?.role?.toLowerCase()?.trim() === 'admin');

  /**
   * computed() â€” TĂªn hiá»ƒn thá»‹ rĂºt gá»n (láº¥y tĂªn cuá»‘i)
   * "Nguyá»…n Báº£o HĂ¢n" â†’ "HĂ¢n"
   */
  displayName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    const parts = user.fullName.trim().split(' ');
    return parts[parts.length - 1];
  });

  /**
   * computed() â€” TĂªn phĂ²ng ban + chá»©c vá»¥
   * "PhĂ²ng Ká»¹ Thuáº­t - NhĂ¢n ViĂªn"
   */
  userPosition = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return `${user.departmentName} - ${user.positionName}`;
  });

  constructor(private http: HttpClient, private router: Router) {
    /**
     * effect() â€” Tuáº§n 7: Tá»± Ä‘á»“ng bá»™ state vá»›i localStorage
     * Khi _currentUser thay Ä‘á»•i â†’ tá»± Ä‘á»™ng cáº­p nháº­t localStorage
     * KhĂ´ng cáº§n gá»i localStorage.setItem á»Ÿ má»—i nÆ¡i ná»¯a
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
   * ÄÄƒng nháº­p â€” gá»i POST /api/auth/login, lÆ°u token + user info
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // LÆ°u token vĂ o localStorage
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          }
          // Cáº­p nháº­t signal â†’ effect() sáº½ tá»± Ä‘á»“ng bá»™ user vĂ o localStorage
          this._currentUser.set(response.data.user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * ÄÄƒng xuáº¥t â€” xĂ³a token, reset state, redirect vá» login
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Set null â†’ effect() sáº½ tá»± xĂ³a user khá»i localStorage
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Láº¥y JWT token tá»« localStorage
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
   * Load thĂ´ng tin user tá»« localStorage khi khá»Ÿi Ä‘á»™ng app
   */
  private loadUserFromStorage(): UserInfo | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, { oldPassword, newPassword });
  }
}
