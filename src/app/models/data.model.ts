export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface EmployeeInfo {
  id: string;
  fullName: string;
  department: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface AttendanceFormData {
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface AttendanceApiResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord | AttendanceRecord[];
}