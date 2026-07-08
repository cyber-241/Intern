import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
      employeeId: 2,
      employeeCode: 'EMP-1002',
      fullName: 'Nguyễn Bảo Hân',
      email: 'han.nb@attendpro.vn',
      phone: '0901234502',
      gender: 'Nữ',
      dateOfBirth: '22/07/1995',
      address: '456 Lê Lợi, Q3, TP.HCM',
      departmentId: 1,
      departmentName: 'Phòng Kỹ Thuật',
      positionId: 5,
      positionName: 'Nhân Viên',
      salary: 15000000,
      hireDate: '15/06/2024',
      isActive: true,
      avatar: null,
      // Aliases cho template cũ
      id: 'EMP-1002',
      department: 'Phòng Kỹ Thuật'
    },
    success: true,
    message: 'Success'
  };

  currentTimeStr = signal<string>('');
  currentDateStr = signal<string>('');
  userMenuOpen: boolean = false;
  private timerInterval: any;

  constructor(private router: Router) {}

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
    this.currentTimeStr.set(now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));

    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    this.currentDateStr.set(`${dayName}, ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`);
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    this.router.navigate(['/login']);
  }
}