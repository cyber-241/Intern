import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Asset } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5188/api/assets';

  getPaged(page: number, pageSize: number, search: string = '', categoryId?: number, status?: string, employeeId?: number): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (employeeId) url += `&employeeId=${employeeId}`;
    return this.http.get<ApiResponse<any>>(url);
  }

  getById(id: number): Observable<ApiResponse<Asset>> {
    return this.http.get<ApiResponse<Asset>>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/upload`, formData);
  }

  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`);
  }
}
