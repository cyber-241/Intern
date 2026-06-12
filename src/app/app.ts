import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiResponse, EmployeeInfo } from './models/data.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
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
  buttonColor: string = '#4318ff';

  checkIn(): void {
    alert('Chấm công thành công!');
  }
}