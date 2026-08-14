import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { Request, RequestUpdateStatus } from '../../models/request.model';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-request-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-approval.html',
  styleUrls: ['./request-approval.css']
})
export class RequestApproval implements OnInit {
  requests: Request[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';
  filterType = '';
  filterStatus = 'Pending'; // Mặc định hiển thị chờ duyệt
  
  searchSubject = new Subject<string>();

  selectedRequest: Request | null = null;
  reviewNote = '';

  modalState = {
    isOpen: false,
    title: '',
    message: '',
    description: '',
    isConfirm: false,
    onConfirm: () => {}
  };

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

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.onSearch();
    });
    this.loadRequests();
  }

  loadRequests(): void {
    this.requestService.getAllRequests(this.currentPage, this.pageSize, this.searchQuery, this.filterType, this.filterStatus)
      .subscribe(res => {
        if (res.success && res.data) {
          this.requests = res.data.items;
          this.totalCount = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  openApprovalModal(request: Request): void {
    this.openModal(
      'Chi tiết Yêu cầu', 
      `Mã đơn: ${request.requestCode}\nNgười gửi: ${request.employeeName} (${request.employeeCode})\nTiêu đề: ${request.title}`,
      false, 
      () => {}, 
      request.description || 'Không có mô tả chi tiết'
    );
  }

  closeApprovalModal(): void {
    this.selectedRequest = null;
    this.reviewNote = '';
  }

  updateStatus(status: string): void {
    if (!this.selectedRequest) return;
    
    if (status === 'Rejected' && !this.reviewNote.trim()) {
      this.openModal('Lỗi', 'Vui lòng nhập lý do từ chối vào ghi chú.');
      return;
    }

    const payload: RequestUpdateStatus = {
      status: status,
      reviewNote: this.reviewNote
    };

    this.requestService.updateRequestStatus(this.selectedRequest.requestId, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeApprovalModal();
          this.loadRequests();
          this.openModal('Thành công', `Đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} yêu cầu thành công.`);
        } else {
          this.openModal('Lỗi', res.message || 'Có lỗi xảy ra.');
        }
      },
      error: (err) => {
        console.error(err);
        this.openModal('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái.');
      }
    });
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
}
