import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-history',
  standalone: true,
  styleUrls: ['./app.css'],
  template: `
    <section class="stat-card">
      <h2>Lịch sử chấm công</h2>
      
      @if (isLoading) {
        <p style="padding: 20px; color: #666; font-style: italic;">Đang tải dữ liệu hệ thống...</p>
      } @else {
        <div class="task-list">
          @for (record of records; track record.id) {
            <div class="task-item">
              <div class="task-info">
                <h4>Ngày: {{ record.date }}</h4>
                <span class="task-time">Vào: {{ record.checkIn }} - Ra: {{ record.checkOut }}</span>
              </div>
              @switch (record.status) {
                @case ('Đúng giờ') {
                  <span class="status-badge done">Đúng giờ</span>
                }
                @case ('Đi trễ') {
                  <span class="status-badge todo">Đi trễ</span>
                }
                @default {
                  <span class="status-badge">Không xác định</span>
                }
              }
            </div>
          }
        </div>
      }
    </section>
  `
})
export class HistoryComponent implements OnInit {
  isLoading = true;
  records: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.records = [
        { id: 1, date: '12/06/2026', checkIn: '07:55', checkOut: '17:05', status: 'Đúng giờ' },
        { id: 2, date: '11/06/2026', checkIn: '08:15', checkOut: '17:00', status: 'Đi trễ' },
        { id: 3, date: '10/06/2026', checkIn: '07:50', checkOut: '17:10', status: 'Đúng giờ' }
      ];
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }
}