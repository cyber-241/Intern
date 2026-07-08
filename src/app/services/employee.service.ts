import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, EmployeeInfo } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5188/api/employees';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả nhân viên
   */
  getAll(): Observable<ApiResponse<EmployeeInfo[]>> {
    return this.http.get<ApiResponse<EmployeeInfo[]>>(this.apiUrl);
  }

  /**
   * Lấy thông tin 1 nhân viên theo ID
   */
  getById(id: number): Observable<ApiResponse<EmployeeInfo>> {
    return this.http.get<ApiResponse<EmployeeInfo>>(`${this.apiUrl}/${id}`);
  }
}
