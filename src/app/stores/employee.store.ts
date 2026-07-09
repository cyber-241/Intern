import { Injectable, signal, computed } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { EmployeeInfo } from '../models/data.model';

/**
 * Employee Store — Tuần 7: State Management bằng Signals
 * Quản lý state nhân viên tập trung — các component chỉ cần inject store
 *
 * Pattern:
 * - Private writable signals (_employees, _isLoading, ...)
 * - Public readonly signals (employees, isLoading, ...)
 * - Computed signals (filteredEmployees, totalEmployees, ...)
 * - Actions (loadEmployees, setSearchQuery, ...)
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeStore {
  // ==================== State Signals ====================
  private _employees = signal<EmployeeInfo[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _searchQuery = signal('');
  private _selectedEmployee = signal<EmployeeInfo | null>(null);
  private _filterDepartment = signal<number | null>(null);

  // ==================== Public Readonly Signals ====================
  readonly employees = this._employees.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedEmployee = this._selectedEmployee.asReadonly();
  readonly filterDepartment = this._filterDepartment.asReadonly();

  // ==================== Computed Signals ====================

  /**
   * computed() — Lọc nhân viên theo search query + phòng ban
   */
  readonly filteredEmployees = computed(() => {
    let result = [...this._employees()];

    // Lọc theo search query (tên, mã, email)
    const query = this._searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(query) ||
        e.employeeCode.toLowerCase().includes(query) ||
        (e.email && e.email.toLowerCase().includes(query))
      );
    }

    // Lọc theo phòng ban
    const deptId = this._filterDepartment();
    if (deptId !== null) {
      result = result.filter(e => e.departmentId === deptId);
    }

    return result;
  });

  /**
   * computed() — Tổng số nhân viên
   */
  readonly totalEmployees = computed(() => this._employees().length);

  /**
   * computed() — Số nhân viên sau khi lọc
   */
  readonly filteredCount = computed(() => this.filteredEmployees().length);

  /**
   * computed() — Nhóm nhân viên theo phòng ban (dùng cho dashboard)
   */
  readonly employeesByDepartment = computed(() => {
    const groups = new Map<string, EmployeeInfo[]>();

    for (const emp of this._employees()) {
      const dept = emp.departmentName || 'Chưa phân phòng';
      if (!groups.has(dept)) {
        groups.set(dept, []);
      }
      groups.get(dept)!.push(emp);
    }

    return groups;
  });

  constructor(private employeeService: EmployeeService) {}

  // ==================== Actions ====================

  /**
   * Load danh sách nhân viên từ API
   */
  loadEmployees(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.employeeService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._employees.set(response.data);
        }
        this._isLoading.set(false);
      },
      error: () => {
        this._error.set('Lỗi khi tải danh sách nhân viên');
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Load thông tin chi tiết 1 nhân viên
   */
  loadEmployeeById(id: number): void {
    this._isLoading.set(true);

    this.employeeService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedEmployee.set(response.data);
        }
        this._isLoading.set(false);
      },
      error: () => {
        this._error.set('Lỗi khi tải thông tin nhân viên');
        this._isLoading.set(false);
      }
    });
  }

  // ==================== Filter Actions ====================

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setFilterDepartment(departmentId: number | null): void {
    this._filterDepartment.set(departmentId);
  }

  selectEmployee(employee: EmployeeInfo | null): void {
    this._selectedEmployee.set(employee);
  }
}
