import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request, RequestCreate, RequestUpdateStatus, PagedResult } from '../models/request.model';
import { ApiResponse } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:5188/api/requests'; // Sẽ gọi qua proxy nếu có, mặc định gõ đúng port của backend

  constructor(private http: HttpClient) { }

  getMyRequests(page: number = 1, pageSize: number = 10, search?: string, type?: string, status?: string): Observable<ApiResponse<PagedResult<Request>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PagedResult<Request>>>(`${this.apiUrl}/my`, { params });
  }

  getAllRequests(page: number = 1, pageSize: number = 10, search?: string, type?: string, status?: string): Observable<ApiResponse<PagedResult<Request>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PagedResult<Request>>>(`${this.apiUrl}/all`, { params });
  }

  getRequestById(id: number): Observable<ApiResponse<Request>> {
    return this.http.get<ApiResponse<Request>>(`${this.apiUrl}/${id}`);
  }

  createRequest(request: RequestCreate): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, request);
  }

  updateRequestStatus(id: number, statusDto: RequestUpdateStatus): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/status`, statusDto);
  }

  updateRequest(id: number, request: RequestCreate): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  deleteRequest(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
