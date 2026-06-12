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