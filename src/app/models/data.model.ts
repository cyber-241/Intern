export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status?: number;
}

export interface EmployeeInfo {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  avatar: string | null;
  // Aliases cho backward compatibility (dùng trong app.ts/app.html)
  id?: string;
  department?: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  deductionAmount: number;
  note: string;
  fullName?: string;
  departmentName?: string;
  positionName?: string;
}

export interface AttendanceFormData {
  // Fields mới cho API SQL Server
  employeeId?: number;
  workDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  deductionAmount?: number;
  note?: string;
  // Fields cũ cho backward compatibility
  date?: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
}

export interface AttendanceApiResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord | AttendanceRecord[];
}

export interface MonthlyDeductionSummary {
  employeeCode: string;
  fullName: string;
  departmentName: string;
  positionName: string;
  baseSalary: number;
  totalWorkDays: number;
  onTimeDays: number;
  lateDays: number;
  totalLateMinutes: number;
  totalDeduction: number;
  actualSalary: number;
}

export interface Department {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description: string | null;
  managerId: number | null;
  managerName: string | null;
  phone: string | null;
  isActive: boolean;
}