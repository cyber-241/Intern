import { Injectable, signal, computed } from '@angular/core';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceRecord, AttendanceFormData } from '../models/data.model';

/**
 * Attendance Store — Tuần 7: State Management bằng Signals
 * Quản lý toàn bộ state liên quan đến chấm công bằng Angular Signals
 *
 * Thay vì mỗi component tự subscribe và quản lý state riêng,
 * tất cả state được tập trung tại Store → các component chỉ cần inject store và đọc signals
 *
 * Ưu điểm so với subscribe truyền thống:
 * - Không cần unsubscribe (tránh memory leak)
 * - computed() tự động re-calculate khi dependency thay đổi
 * - State nhất quán giữa các components
 */
@Injectable({
  providedIn: 'root'
})
export class AttendanceStore {
  // ==================== State Signals ====================
  // Nguồn dữ liệu chính (single source of truth)
  private _records = signal<AttendanceRecord[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Filter state
  private _searchQuery = signal('');
  private _filterStatus = signal('all');
  private _selectedMonth = signal(new Date().getMonth() + 1);
  private _selectedYear = signal(new Date().getFullYear());

  // ==================== Public Readonly Signals ====================
  // Expose state qua readonly signals — components chỉ đọc, không ghi trực tiếp
  readonly records = this._records.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly filterStatus = this._filterStatus.asReadonly();
  readonly selectedMonth = this._selectedMonth.asReadonly();
  readonly selectedYear = this._selectedYear.asReadonly();

  // ==================== Computed Signals (derived state) ====================

  /**
   * computed() — Tự động lọc records theo searchQuery + filterStatus
   * Khi _records, _searchQuery, hoặc _filterStatus thay đổi → filteredRecords tự động re-calculate
   */
  readonly filteredRecords = computed(() => {
    let result = [...this._records()];

    // Lọc theo search query (ngày)
    const query = this._searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(r => r.date.toLowerCase().includes(query));
    }

    // Lọc theo trạng thái
    const status = this._filterStatus();
    if (status !== 'all') {
      result = result.filter(r => r.status === status);
    }

    return result;
  });

  /**
   * computed() — Thống kê tổng số ngày công
   */
  readonly totalDays = computed(() => this._records().length);

  /**
   * computed() — Đếm số ngày đúng giờ
   */
  readonly onTimeDays = computed(() =>
    this._records().filter(r => r.status === 'Đúng giờ').length
  );

  /**
   * computed() — Đếm số ngày đi trễ
   */
  readonly lateDays = computed(() =>
    this._records().filter(r => r.status === 'Đi trễ').length
  );

  /**
   * computed() — Tính tỷ lệ đúng giờ (%)
   */
  readonly onTimePercent = computed(() => {
    const total = this.totalDays();
    return total > 0 ? Math.round((this.onTimeDays() / total) * 100) : 0;
  });

  /**
   * computed() — Lấy 5 bản ghi gần nhất
   */
  readonly recentRecords = computed(() => this._records().slice(0, 5));

  /**
   * computed() — Tổng số phút đi trễ
   */
  readonly totalLateMinutes = computed(() =>
    this._records().reduce((sum, r) => sum + (r.lateMinutes || 0), 0)
  );

  /**
   * computed() — Tổng tiền trừ lương
   */
  readonly totalDeduction = computed(() =>
    this._records().reduce((sum, r) => sum + (r.deductionAmount || 0), 0)
  );

  constructor(private attendanceService: AttendanceService) {}

  // ==================== Actions (thay đổi state) ====================

  /**
   * Load toàn bộ chấm công từ API
   */
  loadRecords(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.attendanceService.getAll().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this._records.set(response.data as AttendanceRecord[]);
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Lỗi khi tải dữ liệu chấm công');
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Thêm bản ghi chấm công mới
   * Sau khi thành công → reload lại danh sách
   */
  addRecord(data: AttendanceFormData): Promise<boolean> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this.attendanceService.create(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRecords(); // Reload data
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: () => {
          this._isLoading.set(false);
          resolve(false);
        }
      });
    });
  }

  /**
   * Cập nhật bản ghi chấm công
   */
  updateRecord(id: number, data: AttendanceFormData): Promise<boolean> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this.attendanceService.update(id, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRecords(); // Reload data
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: () => {
          this._isLoading.set(false);
          resolve(false);
        }
      });
    });
  }

  /**
   * Xóa bản ghi chấm công
   */
  deleteRecord(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this.attendanceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRecords(); // Reload data
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: () => {
          this._isLoading.set(false);
          resolve(false);
        }
      });
    });
  }

  // ==================== Filter Actions ====================

  /**
   * Cập nhật search query
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Cập nhật filter status
   */
  setFilterStatus(status: string): void {
    this._filterStatus.set(status);
  }

  /**
   * Cập nhật tháng/năm đang xem
   */
  setMonthYear(month: number, year: number): void {
    this._selectedMonth.set(month);
    this._selectedYear.set(year);
  }
}
