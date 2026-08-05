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
  positionLevel: number;
  salary: number;
  hireDate: string;
  isActive: boolean;
  avatar: string | null;
  totalLateMinutes?: number;
  totalDeduction?: number;
  dailyAttendance?: {
    attendanceId?: number;
    checkInTime?: string;
    checkOutTime?: string;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
    deductionAmount?: number;
    status?: string;
  } | null;
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

export interface Position {
  positionId: number;
  positionCode: string;
  positionName: string;
  description: string | null;
  baseSalary: number;
  level: number;
  isActive: boolean;
}

// Tuần 12: Quản lý Tài sản cấp phát
export interface AssetCategory {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  assetCount?: number;
}

export interface Asset {
  assetId: number;
  assetCode: string;
  assetName: string;
  description: string | null;
  categoryId: number;
  categoryName: string | null;
  assignedToEmployeeId: number | null;
  assignedEmployeeName: string | null;
  assignedEmployeeCode: string | null;
  serialNumber: string | null;
  purchasePrice: number;
  purchaseDate: string | null;
  status: string;
  imageUrl: string | null;
  isActive: boolean;
}