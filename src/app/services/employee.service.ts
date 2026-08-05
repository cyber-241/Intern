import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, EmployeeInfo, Department } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5188/api/employees';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả nhân viên (có the filter date)
   */
  getAll(date?: string): Observable<ApiResponse<EmployeeInfo[]>> {
    const url = date ? `${this.apiUrl}?date=${date}` : this.apiUrl;
    return this.http.get<ApiResponse<EmployeeInfo[]>>(url);
  }

  /**
   * Tuần 11: Lấy danh sách nhân viên phân trang
   */
  getPaged(page: number, pageSize: number, search: string = '', departmentId: string = ''): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    return this.http.get<ApiResponse<any>>(url);
  }

  /**
   * Lấy thông tin 1 nhân viên theo ID
   */
  getById(id: number): Observable<ApiResponse<EmployeeInfo>> {
    return this.http.get<ApiResponse<EmployeeInfo>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tuần 9: Tạo nhân viên mới
   */
  create(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  }

  /**
   * Tuần 9: Cập nhật nhân viên
   */
  update(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Tuần 9: Xóa nhân viên
   */
  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy danh sách phòng ban (dynamic dropdown)
   */
  getDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>('http://localhost:5188/api/departments');
  }
}
