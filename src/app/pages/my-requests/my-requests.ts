import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { RequestService } from '../../services/request.service';
import { Request, RequestCreate } from '../../models/request.model';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../models/data.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './my-requests.html',
  styleUrls: ['./my-requests.css']
})
export class MyRequests implements OnInit {
  requests: Request[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';
  filterType = '';
  filterStatus = '';
  
  searchSubject = new Subject<string>();

  modalState = {
    isOpen: false,
    title: '',
    message: '',
    description: '',
    isConfirm: false,
    onConfirm: () => {}
  };

  // Form
  showForm = false;
  requestForm: FormGroup;
  myAssets: Asset[] = [];
  isSubmitting = false;
  editingRequestId: number | null = null;

  constructor(
    private requestService: RequestService,
    private assetService: AssetService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      requestType: ['Leave', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      assetId: [null]
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.onSearch();
    });

    this.loadRequests();
    this.loadMyAssets();

    // Lắng nghe thay đổi loại yêu cầu để validate động
    this.requestForm.get('requestType')?.valueChanges.subscribe(type => {
      const startDateCtrl = this.requestForm.get('startDate');
      const endDateCtrl = this.requestForm.get('endDate');
      const assetIdCtrl = this.requestForm.get('assetId');

      if (type === 'Leave') {
        startDateCtrl?.setValidators(Validators.required);
        endDateCtrl?.setValidators(Validators.required);
        assetIdCtrl?.clearValidators();
      } else if (type === 'AssetFix') {
        startDateCtrl?.clearValidators();
        endDateCtrl?.clearValidators();
        assetIdCtrl?.setValidators(Validators.required);
      } else {
        startDateCtrl?.clearValidators();
        endDateCtrl?.clearValidators();
        assetIdCtrl?.clearValidators();
      }

      startDateCtrl?.updateValueAndValidity();
      endDateCtrl?.updateValueAndValidity();
      assetIdCtrl?.updateValueAndValidity();
    });
  }

  loadRequests(): void {
    this.requestService.getMyRequests(this.currentPage, this.pageSize, this.searchQuery, this.filterType, this.filterStatus)
      .subscribe(res => {
        if (res.success && res.data) {
          this.requests = res.data.items;
          this.totalCount = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
      });
  }

  loadMyAssets(): void {
    const currentEmployeeId = this.authService.currentUser()?.employeeId;
    if (!currentEmployeeId) return;

    // Lấy tài sản đang sử dụng CỦA NHÂN VIÊN HIỆN TẠI (với tham số employeeId)
    this.assetService.getPaged(1, 100, '', undefined, 'Đang sử dụng', currentEmployeeId).subscribe(res => {
       if (res.success && res.data) {
         this.myAssets = res.data.items;
       }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onSearchDebounce(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  getTypeBadge(type: string): string {
    switch (type) {
      case 'Leave': return 'badge-leave';
      case 'AssetFix': return 'badge-fix';
      case 'AssetNew': return 'badge-new';
      default: return '';
    }
  }
  
  getTypeName(type: string): string {
    switch (type) {
      case 'Leave': return 'Nghỉ phép';
      case 'AssetFix': return 'Báo hỏng máy';
      case 'AssetNew': return 'Xin cấp máy';
      default: return type;
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      case 'InProgress': return 'badge-info';
      case 'Completed': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.requestForm.reset({ requestType: 'Leave' });
      this.editingRequestId = null;
    }
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.requestForm.value;
    const requestData: RequestCreate = {
      requestType: formValue.requestType,
      title: formValue.title,
      description: formValue.description,
      priority: 'Medium', // Mặc định là Medium theo yêu cầu của user
      startDate: formValue.requestType === 'Leave' ? formValue.startDate : null,
      endDate: formValue.requestType === 'Leave' ? formValue.endDate : null,
      assetId: formValue.requestType === 'AssetFix' ? formValue.assetId : null
    };

    if (this.editingRequestId) {
      this.requestService.updateRequest(this.editingRequestId, requestData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toggleForm();
            this.loadRequests();
            this.openModal('Thành công', 'Đã cập nhật yêu cầu thành công!');
          } else {
            this.openModal('Lỗi', res.message || 'Có lỗi xảy ra.');
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.openModal('Lỗi', 'Lỗi khi cập nhật yêu cầu.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.requestService.createRequest(requestData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toggleForm();
            this.loadRequests();
            this.openModal('Thành công', 'Đã gửi yêu cầu thành công!');
          } else {
            this.openModal('Lỗi', res.message || 'Có lỗi xảy ra.');
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.openModal('Lỗi', 'Lỗi khi gửi yêu cầu.');
          this.isSubmitting = false;
        }
      });
    }
  }

  openModal(title: string, message: string, isConfirm = false, onConfirm = () => {}, description = '') {
    this.modalState = { isOpen: true, title, message, description, isConfirm, onConfirm };
  }

  closeModal() {
    this.modalState.isOpen = false;
  }

  confirmModal() {
    if (this.modalState.onConfirm) this.modalState.onConfirm();
    this.closeModal();
  }

  viewRequest(item: Request): void {
    this.openModal('Chi tiết đơn', `Mã đơn: ${item.requestCode}\nTiêu đề: ${item.title}`, false, () => {}, item.description || 'Không có mô tả chi tiết');
  }

  editRequest(item: Request): void {
    this.editingRequestId = item.requestId;
    
    // Đảm bảo load đúng định dạng Date cho input type="date"
    let startDateVal = '';
    let endDateVal = '';
    if (item.startDate) {
      // YYYY-MM-DD
      startDateVal = item.startDate.split('T')[0];
    }
    if (item.endDate) {
      endDateVal = item.endDate.split('T')[0];
    }

    this.requestForm.patchValue({
      requestType: item.requestType,
      title: item.title,
      description: item.description,
      startDate: startDateVal,
      endDate: endDateVal,
      assetId: item.assetId
    });
    this.showForm = true;
  }

  deleteRequest(item: Request): void {
    this.openModal('Xác nhận', `Bạn có chắc muốn Hủy/Xóa đơn ${item.requestCode} không?`, true, () => {
      this.requestService.deleteRequest(item.requestId).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadRequests();
            this.openModal('Thành công', `Đã xóa đơn ${item.requestCode} thành công.`);
          } else {
            this.openModal('Lỗi', res.message || 'Có lỗi xảy ra.');
          }
        },
        error: (err) => {
          console.error(err);
          this.openModal('Lỗi', 'Lỗi khi xóa đơn.');
        }
      });
    });
  }
}
