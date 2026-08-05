import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AssetCategory } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class AssetCategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5188/api/asset-categories';

  getAll(): Observable<ApiResponse<AssetCategory[]>> {
    return this.http.get<ApiResponse<AssetCategory[]>>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number, search: string = ''): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<ApiResponse<any>>(url);
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
}
