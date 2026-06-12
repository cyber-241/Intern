import { Component } from '@angular/core';
import { ApiResponse, EmployeeInfo, AttendanceRecord } from './models/data.model';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  employeeData: ApiResponse<EmployeeInfo> = {
    data: {
      id: 'EMP-1002',
      fullName: 'Nguyễn Bảo Hân',
      department: 'Phòng Kỹ Thuật'
    },
    status: 200,
    message: 'Success'
  };

  attendanceList: ApiResponse<AttendanceRecord[]> = {
    data: [
      { id: 1, date: '12/06/2026', checkIn: '07:55', checkOut: '17:05', status: 'Đúng giờ' },
      { id: 2, date: '11/06/2026', checkIn: '08:15', checkOut: '17:00', status: 'Đi trễ' },
      { id: 3, date: '10/06/2026', checkIn: '07:50', checkOut: '17:10', status: 'Đúng giờ' }
    ],
    status: 200,
    message: 'Success'
  };

  buttonColor: string = '#4318ff';

  checkIn(): void {
    alert('Chấm công thành công!');
  }
}