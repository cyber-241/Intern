import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceFormData, AttendanceApiResponse } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5188/api/attendance';

  constructor(private http: HttpClient) { }

  getAll(): Observable<AttendanceApiResponse> {
    return this.http.get<AttendanceApiResponse>(this.apiUrl);
  }

  getById(id: number): Observable<AttendanceApiResponse> {
    return this.http.get<AttendanceApiResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: AttendanceFormData): Observable<AttendanceApiResponse> {
    return this.http.post<AttendanceApiResponse>(this.apiUrl, data);
  }

  update(id: number, data: AttendanceFormData): Observable<AttendanceApiResponse> {
    return this.http.put<AttendanceApiResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<AttendanceApiResponse> {
    return this.http.delete<AttendanceApiResponse>(`${this.apiUrl}/${id}`);
  }
}
