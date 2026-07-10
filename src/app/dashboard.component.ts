import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { AttendanceStore } from './stores/attendance.store';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { AttendanceRecord } from './models/data.model';

/**
 * Constants — Dùng tên rõ ràng thay vì magic numbers (theo feedback mentor)
 */
const SUNDAY = 0;
const SATURDAY = 6;
const WORK_START_HOUR = 8;
const WORK_START_MINUTE = 0;
const WORK_END_HOUR = 17;
const WORK_END_MINUTE = 30;
const WORK_START_IN_MINUTES = WORK_START_HOUR * 60 + WORK_START_MINUTE;
const WORK_END_IN_MINUTES = WORK_END_HOUR * 60 + WORK_END_MINUTE;

/**
 * Dashboard Component — Tuần 7: Refactor dùng AttendanceStore (Signals)
 *
 * TRƯỚC (Tuần 6):
 *   - Component tự quản lý state: allRecords = signal<AttendanceRecord[]>([])
 *   - Component tự gọi service.getAll().subscribe(...)
 *   - Component tự tính toán computed signals
 *
 * SAU (Tuần 7):
 *   - Inject AttendanceStore → đọc signals trực tiếp từ store
 *   - Store quản lý state tập trung (single source of truth)
 *   - Nhiều components cùng chia sẻ 1 store → state luôn đồng bộ
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrls: ['./app.css'],
  template: `
    @if (isAdmin()) {
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <span class="material-icons-round">admin_panel_settings</span>
            Bảng điều khiển Quản trị viên
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-card-header"><span class="stat-label">Tổng nhân sự</span></div>
            <div class="stat-value">Đang cập nhật...</div>
          </div>
          <div class="stat-card success">
            <div class="stat-card-header"><span class="stat-label">Hôm nay đúng giờ</span></div>
            <div class="stat-value">Đang cập nhật...</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-card-header"><span class="stat-label">Hôm nay đi trễ</span></div>
            <div class="stat-value">Đang cập nhật...</div>
          </div>
        </div>
        <div class="empty-state" style="margin-top: 20px;">
          <span class="material-icons-round">analytics</span>
          <p>Chức năng Báo cáo & Thống kê dành cho Admin đang được phát triển</p>
        </div>
      </div>
    } @else {
    <!-- Quick Check-in Card -->
    <div class="checkin-card">
      <div class="checkin-content">
        <div class="checkin-info">
          <h3>{{ greeting() }}</h3>
          <div class="checkin-time">{{ currentTime }}</div>
          <div class="checkin-date">{{ currentDate }}</div>
        </div>
        <button class="btn-checkin-large" (click)="quickCheckIn()">
          <span class="material-icons-round">login</span>
          Chấm công ngay
        </button>
      </div>
    </div>

    <!-- Stats Grid — Dùng computed signals từ AttendanceStore -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-card-header">
          <div class="stat-icon primary">
            <span class="material-icons-round">calendar_month</span>
          </div>
          <span class="stat-label">Tổng cộng</span>
        </div>
        <div class="stat-value">{{ store.totalDays() }}</div>
        <div class="stat-desc">Ngày công đã ghi nhận</div>
      </div>

      <div class="stat-card success">
        <div class="stat-card-header">
          <div class="stat-icon success">
            <span class="material-icons-round">check_circle</span>
          </div>
          <span class="stat-label">Đúng giờ</span>
        </div>
        <div class="stat-value">{{ store.onTimeDays() }}</div>
        <div class="stat-desc">Ngày đi đúng giờ</div>
      </div>

      <div class="stat-card danger">
        <div class="stat-card-header">
          <div class="stat-icon danger">
            <span class="material-icons-round">warning</span>
          </div>
          <span class="stat-label">Đi trễ</span>
        </div>
        <div class="stat-value">{{ store.lateDays() }}</div>
        <div class="stat-desc">Ngày đi trễ</div>
      </div>

      <div class="stat-card info">
        <div class="stat-card-header">
          <div class="stat-icon info">
            <span class="material-icons-round">percent</span>
          </div>
          <span class="stat-label">Tỷ lệ</span>
        </div>
        <div class="stat-value">{{ store.onTimePercent() }}%</div>
        <div class="stat-desc">Tỷ lệ đúng giờ</div>
      </div>
    </div>

    <!-- Recent Records — Dùng recentRecords từ store -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round">schedule</span>
          Chấm công gần đây
        </div>
      </div>

      @if (store.isLoading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else if (store.recentRecords().length === 0) {
        <div class="empty-state">
          <span class="material-icons-round">event_busy</span>
          <p>Chưa có dữ liệu chấm công</p>
          <small>Hãy bắt đầu chấm công ngày hôm nay!</small>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              @for (record of store.recentRecords(); track record.id; let i = $index) {
                <tr>
                  <td class="td-index">{{ i + 1 }}</td>
                  <td class="td-date">{{ record.date }}</td>
                  <td>
                    <div class="td-time">
                      <span class="material-icons-round">login</span>
                      {{ record.checkIn }}
                    </div>
                  </td>
                  <td>
                    <div class="td-time">
                      <span class="material-icons-round">logout</span>
                      {{ record.checkOut }}
                    </div>
                  </td>
                  <td>
                    @switch (record.status) {
                      @case ('Đúng giờ') { <span class="status-badge done">Đúng giờ</span> }
                      @case ('Đi trễ') { <span class="status-badge todo">Đi trễ</span> }
                      @case ('Đang làm việc') { <span class="status-badge doing" style="background: var(--info-bg); color: var(--info);">Đang làm việc</span> }
                      @default { <span class="status-badge">{{ record.status }}</span> }
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
    }
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  /**
   * Tuần 7: Inject AttendanceStore thay vì AttendanceService
   * Store quản lý state tập trung, component chỉ đọc signals
   */
  currentTime = '';
  currentDate = '';

  // Tuần 8: Quyền Admin
  isAdmin = computed(() => this.authService.isAdmin());

  private timerInterval: any;

  /**
   * Computed: Lời chào theo thời gian trong ngày
   * Vẫn giữ ở component vì đây là UI logic, không phải business state
   */
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xin chào, chào buổi sáng!';
    if (hour < 18) return 'Xin chào, chào buổi chiều!';
    return 'Xin chào, chào buổi tối!';
  });

  constructor(
    public store: AttendanceStore,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 1000);

    // Tuần 7: Gọi store.loadRecords() thay vì tự gọi service
    this.store.loadRecords();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    this.currentDate = `${dayName}, ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  }

  quickCheckIn(): void {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Kiểm tra Thứ 7 và Chủ nhật — dùng constants rõ ràng
    if (dayOfWeek === SUNDAY || dayOfWeek === SATURDAY) {
      this.notificationService.warning('Hôm nay là cuối tuần! Chỉ được chấm công từ Thứ 2 đến Thứ 6.');
      return;
    }

    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    // Format ngày dd/MM/yyyy có zero-padding, khớp chính xác với SP backend trả về
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateForCompare = `${dd}/${mm}/${yyyy}`;  // So sánh với r.date từ SP
    const dateForApi = `${yyyy}-${mm}-${dd}`;       // Gửi cho SQL Server (ISO format)

    // Tuần 7: Đọc records từ store thay vì local signal
    const todayRecord = this.store.records().find(r => r.date === dateForCompare);

    if (todayRecord) {
      // Đã chấm vào rồi, giờ kiểm tra xem đã chấm ra chưa
      if (todayRecord.checkOut && todayRecord.checkOut !== '' && todayRecord.checkOut !== '--:--') {
        this.notificationService.warning('Bạn đã chấm công ra ngày hôm nay rồi!');
        return;
      }

      // Thực hiện CHẤM CÔNG RA
      const checkInMinutes = this.parseTimeStr(todayRecord.checkIn);
      const checkOutMinutes = this.parseTimeStr(time);
      
      // Đi trễ nếu vào sau giờ bắt đầu HOẶC ra trước giờ kết thúc
      const isLate = checkInMinutes > WORK_START_IN_MINUTES || checkOutMinutes < WORK_END_IN_MINUTES;

      const updateData = {
        ...todayRecord,
        workDate: dateForApi,
        checkOut: time,
        status: isLate ? 'Đi trễ' : 'Đúng giờ'
      };

      // Tuần 7: Dùng store.updateRecord() (trả về Promise) thay vì service.subscribe()
      this.store.updateRecord(todayRecord.id, updateData).then(success => {
        if (success) {
          this.notificationService.success(`Chấm công RA thành công lúc ${time}! Trạng thái: ${updateData.status}`);
        }
      });

    } else {
      // Thực hiện CHẤM CÔNG VÀO
      const newRecord = {
        workDate: dateForApi,
        date: dateForCompare,
        checkIn: time,
        checkOut: '',
        status: 'Đang làm việc'
      };

      // Tuần 7: Dùng store.addRecord() thay vì service.subscribe()
      this.store.addRecord(newRecord).then(success => {
        if (success) {
          this.notificationService.success(`Chấm công VÀO thành công lúc ${time}! Đừng quên chấm công ra sau 17:30 nhé.`);
        }
      });
    }
  }

  parseTimeStr(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
}