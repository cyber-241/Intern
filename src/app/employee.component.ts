import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchFilterComponent } from './shared/components/search-filter/search-filter.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { EmployeeService } from './services/employee.service';
import { PositionService } from './services/position.service';
import { EmployeeInfo, Department, Position } from './models/data.model';
import { NotificationService } from './services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, SearchFilterComponent, PaginationComponent],
  template: `
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round text-primary">badge</span>
          Quản lý nhân viên
        </div>
      </div>

      <div class="toolbar mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button class="btn-primary" (click)="openAddModal()">
          <span class="material-icons-round">person_add</span> Thêm Nhân Viên
        </button>
        <div style="display: flex; gap: 10px; align-items: center;">
          <select class="form-control" style="width: auto;" (change)="onDepartmentChange($event)">
            <option value="">Tất cả phòng ban</option>
            @for (dept of departments; track dept.departmentId) {
              <option [value]="dept.departmentId">{{ dept.departmentName }}</option>
            }
          </select>
          <app-search-filter
            placeholder="Tìm theo mã, tên, email..."
            (searchChanged)="onSearch($event)"
          ></app-search-filter>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px">STT</th>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Lương</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            @for (emp of employees; track emp.employeeId; let i = $index) {
              <tr>
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="font-weight-600">{{ emp.employeeCode }}</td>
                <td>
                  {{ emp.fullName }}
                  @if (emp.positionLevel >= 5) {
                    <span class="badge badge-light" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; margin-left: 8px; font-size: 0.7rem; border: 1px solid rgba(239, 68, 68, 0.2);">{{ emp.positionName }}</span>
                  } @else if (emp.positionLevel === 4) {
                    <span class="badge badge-light" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; margin-left: 8px; font-size: 0.7rem; border: 1px solid rgba(245, 158, 11, 0.2);">{{ emp.positionName }}</span>
                  } @else if (emp.positionLevel === 3) {
                    <span class="badge badge-light" style="background: rgba(67, 24, 255, 0.1); color: var(--primary); margin-left: 8px; font-size: 0.7rem;">{{ emp.positionName }}</span>
                  }
                </td>
                <td class="text-muted">{{ emp.email }}</td>
                <td class="text-muted">{{ emp.phone || '-' }}</td>
                <td>{{ emp.departmentName }}</td>
                <td>{{ emp.positionName }}</td>
                <td class="font-weight-600">{{ emp.salary | number }} ₫</td>
                <td>
                  <div class="td-actions justify-end">
                    <button class="btn-icon-action text-info" (click)="openEditModal(emp)" title="Sửa thông tin">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon-action text-danger" (click)="deleteEmployee(emp.employeeId)" title="Xóa nhân viên">
                      <span class="material-icons-round">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (employees.length === 0) {
              <tr>
                <td colspan="9" class="text-center py-5 text-muted">
                  <span class="material-icons-round" style="font-size: 3rem; opacity: 0.2">hourglass_empty</span>
                  <div class="mt-2">Không tìm thấy dữ liệu...</div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        
        @if (totalItems > 0) {
          <app-pagination
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [totalItems]="totalItems"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        }
      </div>
    </div>

    <!-- Modal Thêm/Sửa Nhân Viên -->
    @if (showModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <form [formGroup]="empForm" (ngSubmit)="onSubmit()">
            <div class="modal-body">
              
              <!-- Error messages từ backend -->
              @if (backendErrors.length > 0) {
                <div class="alert alert-danger mb-3">
                  <ul class="mb-0 px-3">
                    @for (err of backendErrors; track err) {
                      <li>{{ err }}</li>
                    }
                  </ul>
                </div>
              }

              <div class="row">
                @if (isEditing) {
                  <div class="col-md-6 mb-3">
                    <label>Mã NV (*)</label>
                    <input type="text" formControlName="employeeCode" class="form-control" [readonly]="true">
                  </div>
                }
                <div class="mb-3" [class.col-md-6]="isEditing" [class.col-md-12]="!isEditing">
                  <label>Họ và tên (*)</label>
                  <input type="text" formControlName="fullName" class="form-control">
                  @if (empForm.get('fullName')?.invalid && empForm.get('fullName')?.touched) {
                    <div class="error-message">Họ tên không được để trống.</div>
                  }
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label>Email (*)</label>
                  <input type="email" formControlName="email" class="form-control">
                  @if (empForm.get('email')?.invalid && empForm.get('email')?.touched) {
                    <div class="error-message">Email không đúng định dạng.</div>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label>Số điện thoại (*)</label>
                  <input type="text" formControlName="phone" class="form-control">
                  @if (empForm.get('phone')?.invalid && empForm.get('phone')?.touched) {
                    <div class="error-message">Số điện thoại không hợp lệ.</div>
                  }
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label>Giới tính (*)</label>
                  <select formControlName="gender" class="form-control">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label>Phòng ban (*)</label>
                  <select formControlName="departmentId" class="form-control">
                    @for (dept of departments; track dept.departmentId) {
                      <option [value]="dept.departmentId">{{ dept.departmentName }}</option>
                    }
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label>Chức vụ (*)</label>
                  <select formControlName="positionId" class="form-control">
                    @for (pos of positions; track pos.positionId) {
                      <option [value]="pos.positionId">{{ pos.positionName }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label>Mức lương (*)</label>
                  <input type="number" formControlName="salary" class="form-control">
                  @if (empForm.get('salary')?.invalid && empForm.get('salary')?.touched) {
                    <div class="error-message">Mức lương không hợp lệ.</div>
                  }
                </div>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeModal()">Hủy</button>
              <button type="submit" class="btn-primary" [disabled]="empForm.invalid">
                Lưu dữ liệu
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Thông tin đăng nhập sau khi tạo nhân viên -->
    @if (showCredentialModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 460px;">
          <div class="modal-header" style="background: linear-gradient(135deg, var(--primary), #5c4dff);">
            <h3 style="color: white; display: flex; align-items: center; gap: 8px; font-size: 1.15rem; margin: 0;">
              <span class="material-icons-round">how_to_reg</span>
              Tạo nhân viên thành công!
            </h3>
            <button class="btn-close" style="color: white;" (click)="showCredentialModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div style="background: var(--bg-main); border-radius: 12px; padding: 20px; border: 1px solid var(--border);">
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">Hãy gửi thông tin đăng nhập dưới đây cho nhân viên mới:</p>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span class="material-icons-round" style="color: var(--primary);">person</span>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Tên đăng nhập</div>
                  <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); font-family: monospace;">{{ createdUsername }}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="material-icons-round" style="color: var(--primary);">lock</span>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Mật khẩu mặc định</div>
                  <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); font-family: monospace;">{{ createdPassword }}</div>
                </div>
              </div>
            </div>
            <div style="margin-top: 16px; padding: 12px 16px; background: rgba(255, 152, 0, 0.08); border-radius: 8px; border: 1px solid rgba(255, 152, 0, 0.2);">
              <div style="display: flex; align-items: flex-start; gap: 8px;">
                <span class="material-icons-round" style="color: #ed6c02; font-size: 1.1rem; flex-shrink: 0; margin-top: 2px;">warning</span>
                <span style="font-size: 0.82rem; color: #ed6c02;">Nhắc nhân viên đổi mật khẩu sau khi đăng nhập lần đầu.</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" (click)="showCredentialModal = false" style="margin-left: auto;">
              <span class="material-icons-round">check</span>
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .section-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .text-primary { color: var(--primary); }
    .text-info { color: var(--info); }
    .text-danger { color: var(--danger); }
    .text-muted { color: var(--text-secondary); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .justify-end { justify-content: flex-end; }
    .font-weight-600 { font-weight: 600; }
    .mt-2 { margin-top: 8px; }
    .py-5 { padding-top: 40px; padding-bottom: 40px; }
    .mb-4 { margin-bottom: 16px; }

    .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
    .badge-light { background: var(--bg-main); color: var(--text-secondary); border: 1px solid var(--border); }

    .table-responsive { overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--border); }
    .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
    .custom-table th { background: var(--bg-hover); padding: 14px 16px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
    .custom-table td { padding: 16px; font-size: 0.9rem; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    .custom-table tbody tr { transition: all 0.2s; }
    .custom-table tbody tr:hover { background: var(--bg-hover); }
    .custom-table tbody tr:last-child td { border-bottom: none; }

    .td-actions { display: flex; gap: 8px; }
    .btn-icon-action { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon-action .material-icons-round { font-size: 1.1rem; }
    .btn-icon-action.text-info:hover { background: var(--info-bg); }
    .btn-icon-action.text-danger:hover { background: var(--danger-bg); }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 5, 39, 0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
    .modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 100%; box-shadow: var(--shadow-xl); animation: slideUp 0.3s ease; overflow: hidden; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover); }
    .modal-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .btn-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); transition: color 0.2s; }
    .btn-close:hover { color: var(--danger); }
    
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: var(--bg-hover); }
    
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; transition: all 0.2s; outline: none; font-family: inherit; background: var(--bg-card); }
    .form-control:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px var(--primary-glow); }
    .form-control[readonly] { background: var(--bg-main); color: var(--text-secondary); cursor: not-allowed; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px; }

    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(67, 24, 255, 0.2); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(67, 24, 255, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .btn-outline { background: transparent; color: var(--text-primary); border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: var(--bg-hover); border-color: var(--text-secondary); }

    .row { display: flex; flex-wrap: wrap; margin-right: -10px; margin-left: -10px; }
    .col-md-6 { flex: 0 0 50%; max-width: 50%; padding-right: 10px; padding-left: 10px; box-sizing: border-box; }
    .col-md-12 { flex: 0 0 100%; max-width: 100%; padding-right: 10px; padding-left: 10px; box-sizing: border-box; }
    .mb-3 { margin-bottom: 1.2rem; }
    
    .error-message { color: var(--danger); font-size: 0.8rem; margin-top: 6px; font-weight: 500; }
    .alert-danger { background-color: var(--danger-bg); color: var(--danger); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); }
    .mb-0 { margin-bottom: 0; }
  `]
})
export class EmployeeComponent implements OnInit {
  private empService = inject(EmployeeService);
  private positionService = inject(PositionService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);

  // Pagination state
  employees: EmployeeInfo[] = [];
  departments: Department[] = [];
  positions: Position[] = [];
  
  searchQuery: string = '';
  departmentFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;

  // Modal state
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  backendErrors: string[] = [];

  // Credential modal state
  showCredentialModal = false;
  createdUsername = '';
  createdPassword = '';

  empForm: FormGroup = this.fb.group({
    employeeCode: ['Tự động tạo'],
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    gender: ['Nam', Validators.required],
    departmentId: [1, Validators.required],
    positionId: [5, Validators.required],
    salary: [15000000, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadPositions();
  }

  loadDepartments() {
    this.empService.getDepartments().subscribe({
      next: (res) => {
        if (res.success) {
          this.departments = res.data;
        }
      }
    });
  }

  loadPositions() {
    this.positionService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.positions = res.data;
        }
      }
    });
  }

  loadEmployees() {
    // Calling the new Paged API (Will be implemented in backend)
    this.empService.getPaged(this.currentPage, this.pageSize, this.searchQuery, this.departmentFilter).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data.items;
          this.totalItems = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => this.notif.error('Không thể tải dữ liệu nhân viên')
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadEmployees();
  }

  onDepartmentChange(event: any) {
    this.departmentFilter = event.target.value;
    this.currentPage = 1;
    this.loadEmployees();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadEmployees();
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.backendErrors = [];
    this.empForm.reset({
      employeeCode: 'Tự động tạo',
      gender: 'Nam',
      departmentId: 1,
      positionId: 5,
      salary: 15000000,
      isActive: true
    });
    this.empForm.get('employeeCode')?.disable();
    this.showModal = true;
  }

  openEditModal(emp: EmployeeInfo) {
    this.isEditing = true;
    this.editingId = emp.employeeId;
    this.backendErrors = [];
    
    this.empForm.patchValue({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      gender: emp.gender,
      departmentId: emp.departmentId,
      positionId: emp.positionId,
      salary: emp.salary,
      isActive: emp.isActive
    });
    this.empForm.get('employeeCode')?.disable();
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.empForm.invalid) return;
    this.backendErrors = [];

    const formData = this.empForm.getRawValue();
    
    const request = this.isEditing 
      ? this.empService.update(this.editingId!, formData)
      : this.empService.create(formData);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadEmployees();
          if (this.isEditing) {
            this.notif.success('Cập nhật thành công!');
          } else {
            // Hiển thị thông tin đăng nhập cho nhân viên mới
            this.createdUsername = res.data?.username || '';
            this.createdPassword = res.data?.defaultPassword || '123456';
            this.showCredentialModal = true;
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error?.data && Array.isArray(err.error.data)) {
          this.backendErrors = err.error.data;
        } else {
          const msg = err.error?.message || 'Có lỗi xảy ra trên server';
          this.notif.error(msg);
        }
      }
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      this.empService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.notif.success('Đã xóa nhân viên');
            this.loadEmployees();
          }
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message || 'Có lỗi xảy ra khi xóa';
          this.notif.error(`Lỗi Server: ${msg}`);
        }
      });
    }
  }
}
