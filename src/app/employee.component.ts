import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './services/employee.service';
import { EmployeeInfo } from './models/data.model';
import { NotificationService } from './services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round text-primary">badge</span>
          Quản lý nhân viên
        </div>
      </div>
      
      <div class="toolbar mb-4">
        <button class="btn-primary" (click)="openAddModal()">
          <span class="material-icons-round">person_add</span> Thêm Nhân Viên
        </button>
      </div>

      <!-- Bảng danh sách nhân viên -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of employees">
              <td class="font-weight-600">{{ emp.employeeCode }}</td>
              <td>{{ emp.fullName }}</td>
              <td class="text-muted">{{ emp.email }}</td>
              <td><span class="badge badge-light">{{ emp.departmentName }}</span></td>
              <td>{{ emp.positionName }}</td>
              <td>
                <div class="td-actions justify-end">
                  <button class="btn-icon-action text-info" (click)="openEditModal(emp)" title="Sửa">
                    <span class="material-icons-round">edit_square</span>
                  </button>
                  <button class="btn-icon-action text-danger" (click)="deleteEmployee(emp.employeeId)" title="Xóa">
                    <span class="material-icons-round">delete_outline</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="employees.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <span class="material-icons-round" style="font-size: 3rem; opacity: 0.2">hourglass_empty</span>
                <div class="mt-2">Đang tải dữ liệu...</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Thêm/Sửa -->
    <div class="modal-overlay" *ngIf="showModal">
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
            <div class="alert alert-danger mb-3" *ngIf="backendErrors.length > 0">
              <ul class="mb-0 px-3">
                <li *ngFor="let err of backendErrors">{{ err }}</li>
              </ul>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label>Mã NV (*)</label>
                <input type="text" formControlName="employeeCode" class="form-control" [readonly]="isEditing">
                <div class="error-message" *ngIf="empForm.get('employeeCode')?.invalid && empForm.get('employeeCode')?.touched">
                  Vui lòng nhập mã NV hợp lệ (tối đa 20 ký tự).
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label>Họ và tên (*)</label>
                <input type="text" formControlName="fullName" class="form-control">
                <div class="error-message" *ngIf="empForm.get('fullName')?.invalid && empForm.get('fullName')?.touched">
                  Họ tên không được để trống.
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label>Email (*)</label>
                <input type="email" formControlName="email" class="form-control">
                <div class="error-message" *ngIf="empForm.get('email')?.invalid && empForm.get('email')?.touched">
                  Email không đúng định dạng.
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label>Số điện thoại (*)</label>
                <input type="text" formControlName="phone" class="form-control">
                <div class="error-message" *ngIf="empForm.get('phone')?.invalid && empForm.get('phone')?.touched">
                  Số điện thoại không hợp lệ.
                </div>
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
                  <option [value]="1">Phòng Kỹ Thuật</option>
                  <option [value]="2">Phòng Nhân Sự</option>
                  <option [value]="3">Phòng Marketing</option>
                  <option [value]="4">Phòng Kế Toán</option>
                  <option [value]="5">Phòng Kinh Doanh</option>
                  <option [value]="6">Phòng Hành Chính</option>
                </select>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label>Chức vụ (*)</label>
                <select formControlName="positionId" class="form-control">
                  <option [value]="1">Giám Đốc</option>
                  <option [value]="2">Phó Giám Đốc</option>
                  <option [value]="3">Trưởng Phòng</option>
                  <option [value]="4">Phó Phòng</option>
                  <option [value]="5">Nhân Viên</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label>Mức lương (*)</label>
                <input type="number" formControlName="salary" class="form-control">
                <div class="error-message" *ngIf="empForm.get('salary')?.invalid && empForm.get('salary')?.touched">
                  Mức lương không hợp lệ.
                </div>
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
  `,
  styles: [`
    .section-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .text-primary { color: var(--primary); }
    .text-info { color: var(--info); }
    .text-danger { color: var(--danger); }
    .text-muted { color: var(--text-secondary); }
    .text-right { text-align: right; }
    .justify-end { justify-content: flex-end; }
    .font-weight-600 { font-weight: 600; }
    .mt-2 { margin-top: 8px; }
    .py-5 { padding-top: 40px; padding-bottom: 40px; }
    
    .badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .badge-light {
      background: var(--bg-main);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .custom-table th {
      background: var(--bg-hover);
      padding: 14px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
    }
    .custom-table td {
      padding: 16px;
      font-size: 0.9rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
    }
    .custom-table tbody tr {
      transition: all 0.2s;
    }
    .custom-table tbody tr:hover {
      background: var(--bg-hover);
    }
    .custom-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Actions */
    .td-actions {
      display: flex;
      gap: 8px;
    }
    .btn-icon-action {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-icon-action .material-icons-round { font-size: 1.1rem; }
    .btn-icon-action.text-info:hover { background: var(--info-bg); }
    .btn-icon-action.text-danger:hover { background: var(--danger-bg); }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 5, 39, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal-content {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      width: 100%;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
      overflow: hidden;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-hover);
    }
    .modal-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .btn-close {
      background: transparent; border: none; font-size: 1.2rem; cursor: pointer;
      color: var(--text-muted); transition: color 0.2s;
    }
    .btn-close:hover { color: var(--danger); }
    
    .modal-body { padding: 24px; }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: var(--bg-hover);
    }
    
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.2s;
      outline: none;
      font-family: inherit;
      background: var(--bg-card);
    }
    .form-control:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .form-control[readonly] { background: var(--bg-main); color: var(--text-secondary); cursor: not-allowed; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px; }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white; border: none; padding: 10px 20px; border-radius: 8px;
      font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(67, 24, 255, 0.2);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(67, 24, 255, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .btn-outline {
      background: transparent; color: var(--text-primary);
      border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px;
      font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--bg-hover); border-color: var(--text-secondary); }

    /* Grid Form */
    .row { display: flex; flex-wrap: wrap; margin-right: -10px; margin-left: -10px; }
    .col-md-6 { flex: 0 0 50%; max-width: 50%; padding-right: 10px; padding-left: 10px; box-sizing: border-box; }
    .mb-3 { margin-bottom: 1.2rem; }
    
    /* Errors */
    .error-message { color: var(--danger); font-size: 0.8rem; margin-top: 6px; font-weight: 500; }
    .alert-danger { background-color: var(--danger-bg); color: var(--danger); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); }
    .mb-0 { margin-bottom: 0; }
  `]
})
export class EmployeeComponent implements OnInit {
  private empService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);

  employees: EmployeeInfo[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  
  backendErrors: string[] = [];

  empForm: FormGroup = this.fb.group({
    employeeCode: ['', [Validators.required, Validators.maxLength(20)]],
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    gender: ['Nam', Validators.required],
    departmentId: [1, Validators.required],
    positionId: [5, Validators.required],
    salary: [15000000, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.empService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.employees = res.data;
        }
      },
      error: (err) => this.notif.error('Không thể tải dữ liệu nhân viên')
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.backendErrors = [];
    this.empForm.reset({
      gender: 'Nam',
      departmentId: 1,
      positionId: 5,
      salary: 15000000
    });
    this.empForm.get('employeeCode')?.enable();
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
      departmentId: 1, // Fix tạm, đáng ra từ API detail phải trả về departmentId
      positionId: 5, // Fix tạm
      salary: 15000000 // Fix tạm
    });
    this.empForm.get('employeeCode')?.disable(); // Không cho sửa mã NV
    
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
          this.notif.success(this.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
          this.closeModal();
          this.loadData();
        }
      },
      error: (err: HttpErrorResponse) => {
        // Tuần 9: Handle Validation Errors & Global Exception
        if (err.status === 400 && err.error?.data && Array.isArray(err.error.data)) {
          // Lỗi từ Validation Filter
          this.backendErrors = err.error.data;
        } else {
          // Lỗi từ Global Exception Middleware (vd 500, 404, etc.)
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
            this.loadData();
          }
        },
        error: (err: HttpErrorResponse) => {
          // Sẽ bị bắt bởi GlobalExceptionMiddleware
          const msg = err.error?.message || 'Có lỗi xảy ra khi xóa';
          this.notif.error(`Lỗi Server: ${msg}`);
        }
      });
    }
  }
}
