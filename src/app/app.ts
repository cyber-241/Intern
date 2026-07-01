import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiResponse, EmployeeInfo } from './models/data.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  employeeData: ApiResponse<EmployeeInfo> = {
    data: {
      id: 'EMP-1002',
      fullName: 'Nguyễn Bảo Hân',
      department: 'Phòng Kỹ Thuật'
    },
    status: 200,
    message: 'Success'
  };

  currentTimeStr: string = '';
  currentDateStr: string = '';
  sidebarOpen: boolean = false;
  private timerInterval: any;

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
    this.currentTimeStr = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    this.currentDateStr = `${dayName}, ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  checkIn(): void {
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    alert(`Chấm công thành công lúc ${time}!`);
  }
}