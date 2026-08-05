import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { SearchFilterComponent } from '../../shared/components/search-filter/search-filter.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmployeeService } from '../../services/employee.service';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeInfo } from '../../models/data.model';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [DecimalPipe, SlicePipe, SearchFilterComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round text-primary">event_available</span>
          Chấm công theo ngày
        </div>
      </div>

      <div class="toolbar mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-icons-round text-primary">calendar_today</span>
          <label style="margin: 0; font-weight: 600;">Chọn ngày:</label>
          <input type="date" class="form-control" style="width: auto; padding: 6px 12px; height: 38px;"
                 [value]="filterDate" (change)="onDateChange($event)">
        </div>
        <app-search-filter
          placeholder="Tìm theo mã, tên nhân viên..."
          (searchChanged)="onSearchAttendance($event)"
        ></app-search-filter>
      </div>

      <div class="attendance-date-info" style="margin-bottom: 16px;">
        <span class="material-icons-round" style="color: var(--primary); vertical-align: middle;">info</span>
        <span style="font-size: 0.9rem; color: var(--text-secondary); margin-left: 4px;">
          Đang xem chấm công ngày <strong style="color: var(--text-primary);">{{ formatDisplayDate(filterDate) }}</strong>
          — Giờ làm việc: <strong>08:00 - 17:30</strong>, Thứ 2 - Thứ 6
        </span>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px">STT</th>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Vi phạm</th>
              <th>Trừ lương</th>
              <th>Trạng thái</th>
              <th class="text-right">Xóa</th>
            </tr>
          </thead>
          <tbody>
            @for (emp of paginatedAttendanceEmployees; track emp.employeeId; let i = $index) {
              <tr>
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="font-weight-600">{{ emp.employeeCode }}</td>
                <td>
                  {{ emp.fullName }}
                  @if (emp.positionLevel >= 5) {
                    <span class="badge badge-light" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; margin-left: 8px; font-size: 0.7rem; border: 1px solid rgba(239, 68, 68, 0.2);">{{ emp.positionName }}</span>
                  } @else if (emp.positionLevel === 4) {
                    <span class="badge badge-light" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; margin-left: 8px; font-size: 0.7rem; border: 1px solid rgba(245, 158, 11, 0.2);">{{ emp.positionName }}</span>
                  } @else if (emp.positionLevel === 3) {
                    <span class="badge badge-light" style="background: rgba(67, 24, 255, 0.1); color: var(--primary); margin-left: 8px; font-size: 0.7rem;">{{ emp.positionName }}</span>
                  }
                </td>
                <td>{{ emp.departmentName }}</td>
                <td>{{ emp.positionName }}</td>
                <td>
                  @if (emp.dailyAttendance?.checkInTime) {
                    <span class="font-weight-600">{{ emp.dailyAttendance?.checkInTime | slice:0:5 }}</span>
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
                <td>
                  @if (emp.dailyAttendance?.checkOutTime) {
                    <span class="font-weight-600">{{ emp.dailyAttendance?.checkOutTime | slice:0:5 }}</span>
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    @if (emp.dailyAttendance?.checkInTime && emp.dailyAttendance?.checkOutTime && (emp.dailyAttendance?.lateMinutes || 0) > 0) {
                      <span class="text-danger" style="white-space: nowrap;">
                        <span class="material-icons-round" style="font-size: 0.9rem; vertical-align: bottom;">schedule</span> Trễ: {{ emp.dailyAttendance?.lateMinutes }}p
                      </span>
                    }
                    @if (emp.dailyAttendance?.checkInTime && emp.dailyAttendance?.checkOutTime && (emp.dailyAttendance?.earlyLeaveMinutes || 0) > 0) {
                      <span class="text-warning" style="white-space: nowrap;">
                        <span class="material-icons-round" style="font-size: 0.9rem; vertical-align: bottom;">directions_run</span> Sớm: {{ emp.dailyAttendance?.earlyLeaveMinutes }}p
                      </span>
                    }
                    @if (!emp.dailyAttendance?.checkInTime || !emp.dailyAttendance?.checkOutTime || (!(emp.dailyAttendance?.lateMinutes || 0) && !(emp.dailyAttendance?.earlyLeaveMinutes || 0))) {
                      <span class="text-muted">-</span>
                    }
                  </div>
                </td>
                <td>
                  @if (emp.dailyAttendance?.checkInTime && emp.dailyAttendance?.checkOutTime && (emp.dailyAttendance?.deductionAmount || 0) > 0) {
                    <span class="text-danger font-weight-600">
                      -{{ emp.dailyAttendance?.deductionAmount | number }} ₫
                    </span>
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
                <td>
                  @if (emp.dailyAttendance?.status) {
                    <app-status-badge [status]="emp.dailyAttendance!.status!"></app-status-badge>
                  } @else {
                    <span class="text-muted">Chưa chấm công</span>
                  }
                </td>
                <td>
                  <div class="td-actions justify-end">
                    @if (emp.dailyAttendance?.attendanceId) {
                      <button class="btn-icon-action text-danger" 
                              (click)="deleteAttendanceRecord(emp.dailyAttendance!.attendanceId!, emp.fullName)" 
                              title="Xóa chấm công ngày này">
                        <span class="material-icons-round">delete_outline</span>
                      </button>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </div>
                </td>
              </tr>
            }
            @if (filteredAttendanceEmployees.length === 0) {
              <tr>
                <td colspan="11" class="text-center py-5 text-muted">
                  <span class="material-icons-round" style="font-size: 3rem; opacity: 0.2">event_busy</span>
                  <div class="mt-2">Không có dữ liệu chấm công cho ngày này...</div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (totalItems > 0) {
          <app-pagination
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [totalItems]="totalItems"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        }
      </div>
    </div>
  `,
  styles: [`
    .section-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .text-primary { color: var(--primary); }
    .text-warning { color: var(--warning); }
    .text-danger { color: var(--danger); }
    .text-muted { color: var(--text-secondary); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .justify-end { justify-content: flex-end; }
    .font-weight-600 { font-weight: 600; }
    .mt-2 { margin-top: 8px; }
    .py-5 { padding-top: 40px; padding-bottom: 40px; }
    .mb-4 { margin-bottom: 16px; }

    /* Status Badges */
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .status-ontime { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .status-late { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .status-working { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

    .badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .badge-light {
      background: var(--bg-main);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .custom-table th {
      background: var(--bg-hover);
      padding: 14px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
    }
    .custom-table td {
      padding: 16px;
      font-size: 0.9rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
    }
    .custom-table tbody tr {
      transition: all 0.2s;
    }
    .custom-table tbody tr:hover {
      background: var(--bg-hover);
    }
    .custom-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Actions */
    .td-actions {
      display: flex;
      gap: 8px;
    }
    .btn-icon-action {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-icon-action .material-icons-round { font-size: 1.1rem; }
    .btn-icon-action.text-danger:hover { background: var(--danger-bg); }
    
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.2s;
      outline: none;
      font-family: inherit;
      background: var(--bg-card);
    }
    .form-control:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
  `]
})
export class AttendanceComponent implements OnInit {
  private empService = inject(EmployeeService);
  private attendanceService = inject(AttendanceService);
  private notif = inject(NotificationService);

  attendanceEmployees: EmployeeInfo[] = [];
  searchAttendanceQuery: string = '';
  filterDate: string = new Date().toISOString().split('T')[0];

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;

  ngOnInit() {
    this.loadAttendanceData();
  }

  get filteredAttendanceEmployees(): EmployeeInfo[] {
    let filtered = this.attendanceEmployees;
    if (this.searchAttendanceQuery) {
      const lowerQuery = this.searchAttendanceQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.fullName.toLowerCase().includes(lowerQuery) || 
        e.employeeCode.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }
  
  // Total items for pagination
  get totalItems(): number {
    return this.filteredAttendanceEmployees.length;
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  // Client-side pagination
  get paginatedAttendanceEmployees(): EmployeeInfo[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAttendanceEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  loadAttendanceData() {
    this.empService.getAll(this.filterDate).subscribe({
      next: (res) => {
        if (res.success) {
          this.attendanceEmployees = res.data;
          this.currentPage = 1;
        }
      },
      error: () => this.notif.error('Không thể tải dữ liệu chấm công')
    });
  }

  onDateChange(event: any) {
    this.filterDate = event.target.value;
    this.loadAttendanceData();
  }

  onSearchAttendance(query: string) {
    this.searchAttendanceQuery = query;
    this.currentPage = 1;
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[d.getDay()]}, ${d.toLocaleDateString('vi-VN')}`;
  }

  deleteAttendanceRecord(attendanceId: number, employeeName: string) {
    if (confirm(`Bạn có chắc chắn muốn xóa bản ghi chấm công ngày ${this.formatDisplayDate(this.filterDate)} của ${employeeName}?`)) {
      this.attendanceService.delete(attendanceId).subscribe({
        next: (res) => {
          if (res.success) {
            this.notif.success(`Đã xóa chấm công của ${employeeName}`);
            this.loadAttendanceData();
          }
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message || 'Có lỗi xảy ra khi xóa chấm công';
          this.notif.error(msg);
        }
      });
    }
  }
}
