import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrls: ['./app.css'],
  template: `
    <section class="stat-card">
      <h2>Bảng điều khiển tổng quan</h2>
      <div class="info-row"><span class="label">Trạng thái hệ thống:</span> <span class="value">Đang hoạt động ổn định</span></div>
      <div class="info-row"><span class="label">Ca làm việc hiện tại:</span> <span class="value">Hành chính (08:00 - 17:00)</span></div>
    </section>
  `
})
export class DashboardComponent {}