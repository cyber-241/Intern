import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Position } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = 'http://localhost:5188/api/positions';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả chức vụ (dynamic, không hard code)
   */
  getAll(): Observable<ApiResponse<Position[]>> {
    return this.http.get<ApiResponse<Position[]>>(this.apiUrl);
  }
}
