import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AttendanceStore } from './stores/attendance.store';
import { AttendanceFormData } from './models/data.model';
import { AuthService } from './services/auth.service';
import { SearchFilterComponent } from './shared/components/search-filter/search-filter.component';
import { StatusBadgeComponent } from './shared/components/status-badge/status-badge.component';
/**
 * ===== CONSTANTS - Dễ đọc, dễ bảo trì (theo feedback mentor) =====
 * Thay vì dùng magic numbers 480, 1050... ta dùng constants có tên rõ ràng
 */
const WORK_START_HOUR = 8;
const WORK_START_MINUTE = 0;
const WORK_END_HOUR = 17;
const WORK_END_MINUTE = 30;

// Quy đổi sang phút để so sánh
const WORK_START_IN_MINUTES = WORK_START_HOUR * 60 + WORK_START_MINUTE;   // = 480
const WORK_END_IN_MINUTES = WORK_END_HOUR * 60 + WORK_END_MINUTE;         // = 1050

// Khoảng giờ hợp lệ cho Check-In (06:00 - 14:00)
// Mở rộng tới 14:00 để cho phép ghi nhận giờ đi trễ thực tế
// Trạng thái "Đi trễ" sẽ được tự động tính dựa trên WORK_START (08:00)
const CHECK_IN_MIN_HOUR = 6;
const CHECK_IN_MIN_MINUTE = 0;
const CHECK_IN_MAX_HOUR = 14;
const CHECK_IN_MAX_MINUTE = 0;
const CHECK_IN_MIN_IN_MINUTES = CHECK_IN_MIN_HOUR * 60 + CHECK_IN_MIN_MINUTE;   // = 360
const CHECK_IN_MAX_IN_MINUTES = CHECK_IN_MAX_HOUR * 60 + CHECK_IN_MAX_MINUTE;   // = 840

// Khoảng giờ hợp lệ cho Check-Out (12:00 - 24:00)
// Mở rộng từ 12:00 để cho phép ghi nhận giờ về sớm thực tế
// Trạng thái "Đi trễ" sẽ được tự động tính dựa trên WORK_END (17:30)
const CHECK_OUT_MIN_HOUR = 12;
const CHECK_OUT_MIN_MINUTE = 0;
const CHECK_OUT_MAX_HOUR = 24;
const CHECK_OUT_MAX_MINUTE = 0;
const CHECK_OUT_MIN_IN_MINUTES = CHECK_OUT_MIN_HOUR * 60 + CHECK_OUT_MIN_MINUTE;  // = 720
const CHECK_OUT_MAX_IN_MINUTES = CHECK_OUT_MAX_HOUR * 60 + CHECK_OUT_MAX_MINUTE;  // = 1440

// Ngày trong tuần — dễ đọc hơn so với dùng 0, 6 trực tiếp (theo feedback mentor)
const SUNDAY = 0;
const SATURDAY = 6;

/**
 * History Component — Tuần 7: Refactor dùng AttendanceStore (Signals)
 *
 * TRƯỚC (Tuần 6):
 *   - records = signal<AttendanceRecord[]>([])            → tự quản lý
 *   - searchQuery = signal('')                             → tự quản lý
 *   - filterStatus = signal('all')                         → tự quản lý
 *   - filteredRecords = computed(...)                       → tự tính toán
 *   - loadData() → service.getAll().subscribe(...)          → tự gọi API
 *
 * SAU (Tuần 7):
 *   - store.records()                  → đọc từ store
 *   - store.searchQuery()              → đọc từ store
 *   - store.filterStatus()            → đọc từ store
 *   - store.filteredRecords()         → computed từ store
 *   - store.loadRecords()             → store gọi API
 *   - store.addRecord/updateRecord/deleteRecord → store xử lý CRUD
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, SearchFilterComponent, StatusBadgeComponent],
  styleUrls: ['./app.css'],
  template: `
    <!-- Toast Notification -->
    @if (toast) {
      <div class="toast-container">
        <div class="toast" [class.error]="toast.isError">
          <div class="toast-icon">
            <span class="material-icons-round">{{ toast.isError ? 'error' : 'check_circle' }}</span>
          </div>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    }

    <!-- Section Card -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round">history</span>
          Lịch sử chấm công
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
            <span class="material-icons-round" style="font-size: 0.9rem;">schedule</span>
            Giờ làm: 08:00 - 17:30 | T2 - T6
          </span>
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            Tổng: {{ store.filteredRecords().length }} bản ghi
          </span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          @if (isAdmin()) {
            <button class="btn-primary" (click)="openAddModal()">
              <span class="material-icons-round">add</span>
              Thêm bản ghi
            </button>
          }
        </div>
        <div class="toolbar-right">
          <app-search-filter
            placeholder="Tìm theo ngày..."
            [filterOptions]="[{label: 'Đúng giờ', value: 'Đúng giờ'}, {label: 'Đi trễ', value: 'Đi trễ'}, {label: 'Đang làm việc', value: 'Đang làm việc'}]"
            [initialSearchQuery]="store.searchQuery()"
            [initialFilterValue]="store.filterStatus()"
            (searchChanged)="store.setSearchQuery($event)"
            (filterChanged)="store.setFilterStatus($event.toString())"
          ></app-search-filter>
        </div>
      </div>

      <!-- Data Table — Dùng store.filteredRecords() -->
      @if (store.isLoading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải dữ liệu hệ thống...</p>
        </div>
      } @else if (store.filteredRecords().length === 0) {
        <div class="empty-state">
          <span class="material-icons-round">inbox</span>
          <p>Không tìm thấy bản ghi nào</p>
          <small>Thay đổi bộ lọc hoặc thêm bản ghi mới</small>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên nhân viên</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Trạng thái</th>
                @if (isAdmin()) {
                  <th>Hành động</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (record of store.filteredRecords(); track record.id; let i = $index) {
                <tr>
                  <td class="td-index">{{ i + 1 }}</td>
                  <td>
                    <div style="font-weight: 500; color: var(--text-primary);">
                      {{ record.fullName || 'Chưa cập nhật' }}
                    </div>
                  </td>
                  <td>{{ record.departmentName || 'Chưa cập nhật' }}</td>
                  <td>{{ record.positionName || 'Chưa cập nhật' }}</td>
                  <td class="td-date">{{ record.date }}</td>
                  <td>
                    <div class="td-time">
                      <span class="material-icons-round">login</span>
                      {{ record.checkIn }}
                    </div>
                  </td>
                  <td>
                    <div class="td-time">
                      <span class="material-icons-round">logout</span>
                      {{ record.checkOut }}
                    </div>
                  </td>
                  <td>
                    <app-status-badge [status]="record.status"></app-status-badge>
                  </td>
                  @if (isAdmin()) {
                    <td>
                      <div class="td-actions">
                        <button class="btn-action edit" title="Sửa" (click)="openEditModal(record)">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button class="btn-action delete" title="Xóa" (click)="openDeleteConfirm(record)">
                          <span class="material-icons-round">delete</span>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Add/Edit Modal (Reactive Form) -->
    @if (showFormModal) {
      <div class="modal-overlay" (click)="closeFormModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <span class="material-icons-round">{{ isEditing ? 'edit_note' : 'add_circle' }}</span>
              {{ isEditing ? 'Chỉnh sửa bản ghi' : 'Thêm bản ghi mới' }}
            </h3>
            <button class="modal-close" (click)="closeFormModal()">
              <span class="material-icons-round">close</span>
            </button>
          </div>

          <form [formGroup]="attendanceForm" (ngSubmit)="saveRecord()" class="modal-body">
            
            @if (attendanceForm.errors?.['checkOutBeforeCheckIn']) {
              <div class="form-error" style="margin-bottom: 16px; text-align: center; font-weight: 500;">
                Giờ ra phải sau giờ vào!
              </div>
            }

            <div class="form-group">
              <label>Ngày làm việc <span class="required">*</span></label>
              <div class="input-with-icon">
                <span class="material-icons-round">calendar_today</span>
                <input
                  type="date"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('date')"
                  formControlName="date"
                />
              </div>
              @if (isFieldInvalid('date')) {
                <div class="form-error">
                  @if (attendanceForm.get('date')?.errors?.['required']) {
                    Vui lòng chọn ngày làm việc.
                  }
                  @if (attendanceForm.get('date')?.errors?.['invalidDate']) {
                    Ngày không hợp lệ.
                  }
                  @if (attendanceForm.get('date')?.errors?.['isSaturday']) {
                    Thứ 7 không được chấm công! Chỉ chấm công Thứ 2 - Thứ 6.
                  }
                  @if (attendanceForm.get('date')?.errors?.['isSunday']) {
                    Chủ nhật không được chấm công! Chỉ chấm công Thứ 2 - Thứ 6.
                  }
                  @if (attendanceForm.get('date')?.errors?.['duplicateDate']) {
                    Ngày này đã được chấm công rồi!
                  }
                </div>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Giờ vào <span class="required">*</span></label>
                <div class="input-with-icon">
                  <span class="material-icons-round">login</span>
                  <input
                    type="time"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('checkIn')"
                    formControlName="checkIn"
                  />
                </div>
                @if (isFieldInvalid('checkIn')) {
                  <div class="form-error">
                    @if (attendanceForm.get('checkIn')?.errors?.['required']) {
                      Vui lòng chọn giờ vào.
                    }
                    @if (attendanceForm.get('checkIn')?.errors?.['invalidTimeRange']) {
                      Giờ vào phải từ 06:00 - 14:00.
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label>Giờ ra</label>
                <div class="input-with-icon">
                  <span class="material-icons-round">logout</span>
                  <input
                    type="time"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('checkOut')"
                    formControlName="checkOut"
                  />
                </div>
                @if (isFieldInvalid('checkOut')) {
                  <div class="form-error">
                    @if (attendanceForm.get('checkOut')?.errors?.['invalidTimeRange']) {
                      Giờ ra phải từ 12:00 - 24:00.
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <div class="input-with-icon">
                <span class="material-icons-round">info</span>
                <select
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('status')"
                  formControlName="status"
                >
                  <option value="" disabled>-- Chọn trạng thái --</option>
                  <option value="Đúng giờ">Đúng giờ</option>
                  <option value="Đi trễ">Đi trễ</option>
                  <option value="Đang làm việc">Đang làm việc</option>
                </select>
                @if (isFieldInvalid('status')) {
                  <div class="form-error">
                    Vui lòng chọn trạng thái.
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeFormModal()">Hủy</button>
              <button type="submit" class="btn-primary" [disabled]="attendanceForm.invalid || store.isLoading()">
                <span class="material-icons-round">save</span>
                Lưu lại
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (showDeleteConfirm) {
      <div class="modal-overlay" (click)="closeDeleteConfirm()">
        <div class="modal-box delete-confirm" (click)="$event.stopPropagation()">
          <div class="delete-icon">
            <span class="material-icons-round">warning</span>
          </div>
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa bản ghi chấm công ngày <strong>{{ recordToDelete?.date }}</strong> không?</p>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">Hành động này không thể hoàn tác.</p>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeDeleteConfirm()">Hủy bỏ</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="store.isLoading()">
              <span class="material-icons-round" style="font-size: 1rem;">delete</span>
              Xóa bản ghi
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HistoryComponent implements OnInit {
  /**
   * Tuần 7: UI state vẫn ở component (không cần share giữa các component)
   * Business state (records, filter) → chuyển sang store
   */
  showFormModal = false;
  showDeleteConfirm = false;
  toast: { message: string; isError: boolean } | null = null;

  isEditing = false;
  editingId: number | null = null;
  recordToDelete: any = null;

  // Form
  attendanceForm!: FormGroup;

  isAdmin: any;

  constructor(
    public store: AttendanceStore,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin;
  }

  ngOnInit(): void {
    this.initForm();
    // Tuần 7: Gọi store.loadRecords() thay vì tự gọi service
    this.store.loadRecords();
  }

  // ===== Khởi tạo Reactive Form =====
  initForm(): void {
    this.attendanceForm = this.fb.group({
      date: ['', [
        Validators.required,
        this.dateValidator.bind(this)
      ]],
      checkIn: ['08:00', [
        Validators.required,
        this.timeRangeValidator(CHECK_IN_MIN_IN_MINUTES, CHECK_IN_MAX_IN_MINUTES)
      ]],
      checkOut: ['', [
        this.checkOutTimeValidator.bind(this)
      ]],
      status: ['Đang làm việc', Validators.required]
    }, {
      validators: this.checkOutAfterCheckInValidator
    });

    // Theo dõi sự thay đổi của giờ vào và giờ ra để tự động cập nhật trạng thái
    this.attendanceForm.valueChanges.subscribe(val => {
      // Chỉ tính toán khi checkIn hợp lệ
      if (this.attendanceForm.get('checkIn')?.valid && !this.attendanceForm.errors?.['checkOutBeforeCheckIn']) {
        const checkIn = val.checkIn;
        const checkOut = val.checkOut;

        if (!checkOut || checkOut.trim() === '') {
          if (val.status !== 'Đang làm việc') {
            this.attendanceForm.get('status')?.setValue('Đang làm việc', { emitEvent: false });
          }
        } else if (this.attendanceForm.get('checkOut')?.valid) {
          const inMinutes = this.parseTimeToMinutes(checkIn);
          const outMinutes = this.parseTimeToMinutes(checkOut);

          // Đi trễ nếu vào sau giờ bắt đầu HOẶC ra trước giờ kết thúc
          const isLate = inMinutes > WORK_START_IN_MINUTES || outMinutes < WORK_END_IN_MINUTES;
          const expectedStatus = isLate ? 'Đi trễ' : 'Đúng giờ';

          if (val.status !== expectedStatus) {
            this.attendanceForm.get('status')?.setValue(expectedStatus, { emitEvent: false });
          }
        }
      }
    });
  }

  // ===== Helper: Chuyển chuỗi "HH:mm" thành số phút =====
  parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  // ===== Helper: Chuyển date input (yyyy-MM-dd) sang dd/MM/yyyy =====
  formatDateForDisplay(dateInputValue: string): string {
    if (!dateInputValue) return '';
    const parts = dateInputValue.split('-');
    if (parts.length !== 3) return dateInputValue;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // ===== Helper: Chuyển dd/MM/yyyy sang yyyy-MM-dd (cho input type="date") =====
  formatDateForInput(displayDate: string): string {
    if (!displayDate) return '';
    const parts = displayDate.split('/');
    if (parts.length !== 3) return displayDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // ===== Custom Validators =====

  /**
   * Validator: Kiểm tra ngày hợp lệ + không phải T7/CN + không trùng
   * Tuần 7: Dùng store.records() thay vì this.records()
   */
  dateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Input type="date" trả về format yyyy-MM-dd
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    }

    // Kiểm tra Thứ 7 và Chủ nhật — dùng tên ngày rõ ràng thay vì số
    const dayOfWeek = date.getDay();
    if (dayOfWeek === SATURDAY) {
      return { isSaturday: true };
    }
    if (dayOfWeek === SUNDAY) {
      return { isSunday: true };
    }

    // Kiểm tra trùng ngày (1 ngày chỉ 1 lần chấm công)
    // Tuần 7: Đọc records từ store
    const displayDate = this.formatDateForDisplay(value);
    const isDuplicate = this.store.records().some(r => {
      if (this.isEditing && r.id === this.editingId) return false;
      return r.date === displayDate;
    });
    if (isDuplicate) {
      return { duplicateDate: true };
    }

    return null;
  }

  /**
   * Validator: Kiểm tra giờ nằm trong khoảng min-max (tính bằng phút)
   */
  timeRangeValidator(minMinutes: number, maxMinutes: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const totalMinutes = this.parseTimeToMinutes(value);
      const parts = value.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return { invalidTimeRange: true };
      }

      if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
        return { invalidTimeRange: true };
      }

      return null;
    };
  }

  /**
   * Validator cho giờ ra: phải từ 17:30 - 24:00
   */
  checkOutTimeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value.trim() === '') return null;

    const totalMinutes = value.split(':').reduce(
      (acc: number, part: string, idx: number) => acc + parseInt(part, 10) * (idx === 0 ? 60 : 1), 0
    );

    if (totalMinutes < CHECK_OUT_MIN_IN_MINUTES || totalMinutes > CHECK_OUT_MAX_IN_MINUTES) {
      return { invalidTimeRange: true };
    }

    return null;
  }

  // Cross-field Validator: giờ ra phải sau giờ vào
  checkOutAfterCheckInValidator(group: AbstractControl): ValidationErrors | null {
    const checkIn = group.get('checkIn')?.value;
    const checkOut = group.get('checkOut')?.value;

    if (!checkIn || !checkOut) return null;

    const inParts = checkIn.split(':');
    const outParts = checkOut.split(':');
    const inMinutes = parseInt(inParts[0], 10) * 60 + parseInt(inParts[1], 10);
    const outMinutes = parseInt(outParts[0], 10) * 60 + parseInt(outParts[1], 10);

    if (outMinutes <= inMinutes) {
      return { checkOutBeforeCheckIn: true };
    }
    return null;
  }

  // Helper: kiểm tra field có lỗi và đã được touch
  isFieldInvalid(fieldName: string): boolean {
    const field = this.attendanceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // ===== Toast =====
  showToast(message: string, isError: boolean = false): void {
    this.toast = { message, isError };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  // ===== Create =====
  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.attendanceForm.reset({
      date: '',
      checkIn: '08:00',
      checkOut: '',
      status: 'Đang làm việc'
    });
    this.showFormModal = true;
  }

  // ===== Update =====
  openEditModal(record: any): void {
    this.isEditing = true;
    this.editingId = record.id;
    this.attendanceForm.reset({
      date: this.formatDateForInput(record.date),
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status
    });
    this.showFormModal = true;
  }

  // ===== Save (Add/Update) — Tuần 7: Dùng store actions =====
  async saveRecord(): Promise<void> {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.attendanceForm.value;

    // Chuyển ngày từ yyyy-MM-dd (input date) sang dd/MM/yyyy (hiển thị)
    const formData: AttendanceFormData = {
      date: this.formatDateForDisplay(formValue.date),
      checkIn: formValue.checkIn,
      checkOut: formValue.checkOut || '',
      status: formValue.status
    };

    let success: boolean;

    if (this.isEditing && this.editingId) {
      // Tuần 7: store.updateRecord() thay vì service.update().subscribe()
      success = await this.store.updateRecord(this.editingId, formData);
      if (success) {
        this.showToast('Đã cập nhật bản ghi thành công!');
        this.closeFormModal();
      } else {
        this.showToast('Cập nhật thất bại!', true);
      }
    } else {
      // Tuần 7: store.addRecord() thay vì service.create().subscribe()
      success = await this.store.addRecord(formData);
      if (success) {
        this.showToast('Đã thêm bản ghi thành công!');
        this.closeFormModal();
      } else {
        this.showToast('Thêm bản ghi thất bại!', true);
      }
    }
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.attendanceForm.reset();
  }

  // ===== Delete =====
  openDeleteConfirm(record: any): void {
    this.recordToDelete = record;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.recordToDelete = null;
  }

  // Tuần 7: Dùng store.deleteRecord() thay vì service.delete().subscribe()
  async confirmDelete(): Promise<void> {
    if (!this.recordToDelete) return;

    const success = await this.store.deleteRecord(this.recordToDelete.id);
    if (success) {
      this.showToast('Đã xóa thành công!');
      this.closeDeleteConfirm();
    } else {
      this.showToast('Xóa thất bại!', true);
    }
  }
}