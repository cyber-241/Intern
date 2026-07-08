import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { AttendanceService } from './services/attendance.service';
import { NotificationService } from './services/notification.service';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrls: ['./app.css'],
  template: `
    <!-- Quick Check-in Card -->
    <div class="checkin-card">
      <div class="checkin-content">
        <div class="checkin-info">
          <h3>{{ greeting() }}</h3>
          <div class="checkin-time">{{ currentTime() }}</div>
          <div class="checkin-date">{{ currentDate() }}</div>
        </div>
        <button class="btn-checkin-large" (click)="quickCheckIn()">
          <span class="material-icons-round">login</span>
          Chấm công ngay
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-card-header">
          <div class="stat-icon primary">
            <span class="material-icons-round">calendar_month</span>
          </div>
          <span class="stat-label">Tổng cộng</span>
        </div>
        <div class="stat-value">{{ totalDays() }}</div>
        <div class="stat-desc">Ngày công đã ghi nhận</div>
      </div>

      <div class="stat-card success">
        <div class="stat-card-header">
          <div class="stat-icon success">
            <span class="material-icons-round">check_circle</span>
          </div>
          <span class="stat-label">Đúng giờ</span>
        </div>
        <div class="stat-value">{{ onTimeDays() }}</div>
        <div class="stat-desc">Ngày đi đúng giờ</div>
      </div>

      <div class="stat-card danger">
        <div class="stat-card-header">
          <div class="stat-icon danger">
            <span class="material-icons-round">warning</span>
          </div>
          <span class="stat-label">Đi trễ</span>
        </div>
        <div class="stat-value">{{ lateDays() }}</div>
        <div class="stat-desc">Ngày đi trễ</div>
      </div>

      <div class="stat-card info">
        <div class="stat-card-header">
          <div class="stat-icon info">
            <span class="material-icons-round">percent</span>
          </div>
          <span class="stat-label">Tỷ lệ</span>
        </div>
        <div class="stat-value">{{ onTimePercent() }}%</div>
        <div class="stat-desc">Tỷ lệ đúng giờ</div>
      </div>
    </div>

    <!-- Recent Records -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round">schedule</span>
          Chấm công gần đây
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else if (recentRecords().length === 0) {
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
              @for (record of recentRecords(); track record.id; let i = $index) {
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
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentTime = signal('');
  currentDate = signal('');
  isLoading = signal(true);
  allRecords = signal<AttendanceRecord[]>([]);

  // Computed signals for derived state
  totalDays = computed(() => this.allRecords().length);
  onTimeDays = computed(() => this.allRecords().filter(r => r.status === 'Đúng giờ').length);
  lateDays = computed(() => this.allRecords().filter(r => r.status === 'Đi trễ').length);
  onTimePercent = computed(() => {
    const total = this.totalDays();
    return total > 0 ? Math.round((this.onTimeDays() / total) * 100) : 0;
  });
  recentRecords = computed(() => this.allRecords().slice(0, 5));

  private timerInterval: any;

  constructor(
    private attendanceService: AttendanceService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 1000);
    this.loadStats();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));

    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    this.currentDate.set(`${dayName}, ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`);
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.attendanceService.getAll().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.allRecords.set(response.data as AttendanceRecord[]);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Lời chào theo thời gian trong ngày
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xin chào, chào buổi sáng!';
    if (hour < 18) return 'Xin chào, chào buổi chiều!';
    return 'Xin chào, chào buổi tối!';
  });

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

    // Tìm xem hôm nay đã có bản ghi nào chưa
    const todayRecord = this.allRecords().find(r => r.date === dateForCompare);

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

      this.attendanceService.update(todayRecord.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`Chấm công RA thành công lúc ${time}! Trạng thái: ${updateData.status}`);
            this.loadStats();
          }
        },
        error: () => {
          // Lỗi sẽ được xử lý bởi errorInterceptor
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

      this.attendanceService.create(newRecord).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`Chấm công VÀO thành công lúc ${time}! Đừng quên chấm công ra sau 17:30 nhé.`);
            this.loadStats();
          }
        },
        error: () => {
          // Lỗi sẽ được xử lý bởi errorInterceptor
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