import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AttendanceRecord, AttendanceFormData, AttendanceApiResponse, MonthlyDeductionSummary } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5188/api/attendance';

  // Mặc định employeeId = 2 (Nguyễn Bảo Hân) — sẽ thay đổi khi có hệ thống login thật
  private defaultEmployeeId = 2;

  constructor(private http: HttpClient) { }

  /**
   * Lấy tất cả chấm công (dùng employeeId mặc định)
   * Giữ lại để backward compatible với dashboard + history component
   */
  getAll(): Observable<AttendanceApiResponse> {
    const params = new HttpParams().set('employeeId', this.defaultEmployeeId.toString());
    return this.http.get<AttendanceApiResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy danh sách chấm công theo nhân viên
   */
  getByEmployee(employeeId: number): Observable<ApiResponse<AttendanceRecord[]>> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<ApiResponse<AttendanceRecord[]>>(this.apiUrl, { params });
  }

  /**
   * Thêm bản ghi chấm công mới
   */
  create(data: AttendanceFormData): Observable<AttendanceApiResponse> {
    // Chuyển đổi format cũ sang format mới nếu cần
    const requestData = {
      employeeId: data.employeeId || this.defaultEmployeeId,
      workDate: data.workDate || data.date || '',
      checkInTime: data.checkInTime || data.checkIn || '',
      checkOutTime: data.checkOutTime || data.checkOut || null,
      status: data.status || 'Đang làm việc',
      lateMinutes: data.lateMinutes || 0,
      earlyLeaveMinutes: data.earlyLeaveMinutes || 0,
      deductionAmount: data.deductionAmount || 0,
      note: data.note || ''
    };
    return this.http.post<AttendanceApiResponse>(this.apiUrl, requestData);
  }

  /**
   * Cập nhật bản ghi chấm công (update qua API)
   * Hiện tại API chưa có PUT endpoint, nhưng giữ method để component không lỗi
   */
  update(id: number, data: AttendanceFormData): Observable<AttendanceApiResponse> {
    const requestData = {
      employeeId: data.employeeId || this.defaultEmployeeId,
      workDate: data.workDate || data.date || '',
      checkInTime: data.checkInTime || data.checkIn || '',
      checkOutTime: data.checkOutTime || data.checkOut || null,
      status: data.status || '',
      lateMinutes: data.lateMinutes || 0,
      earlyLeaveMinutes: data.earlyLeaveMinutes || 0,
      deductionAmount: data.deductionAmount || 0,
      note: data.note || ''
    };
    return this.http.put<AttendanceApiResponse>(`${this.apiUrl}/${id}`, requestData);
  }

  /**
   * Xóa bản ghi chấm công
   */
  delete(id: number): Observable<AttendanceApiResponse> {
    return this.http.delete<AttendanceApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy tổng trừ lương theo tháng
   */
  getMonthlyDeductions(employeeId: number, month: number, year: number): Observable<ApiResponse<MonthlyDeductionSummary>> {
    const params = new HttpParams()
      .set('employeeId', employeeId.toString())
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<ApiResponse<MonthlyDeductionSummary>>(`${this.apiUrl}/deductions`, { params });
  }
}
