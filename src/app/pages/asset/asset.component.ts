import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchFilterComponent } from '../../shared/components/search-filter/search-filter.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AssetService } from '../../services/asset.service';
import { AssetCategoryService } from '../../services/asset-category.service';
import { EmployeeService } from '../../services/employee.service';
import { Asset, AssetCategory } from '../../models/data.model';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-asset',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, SearchFilterComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round text-primary">inventory_2</span>
          Quản lý tài sản cấp phát
        </div>
      </div>

      <div class="toolbar mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button class="btn-primary" (click)="openAddModal()">
          <span class="material-icons-round">add</span> Thêm Tài Sản
        </button>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <select class="form-control" style="width: auto;" (change)="onCategoryChange($event)">
            <option value="">Tất cả danh mục</option>
            @for (cat of allCategories; track cat.categoryId) {
              <option [value]="cat.categoryId">{{ cat.categoryName }}</option>
            }
          </select>
          <select class="form-control" style="width: auto;" (change)="onStatusChange($event)">
            <option value="">Tất cả trạng thái</option>
            <option value="Sẵn sàng">Sẵn sàng</option>
            <option value="Đang sử dụng">Đang sử dụng</option>
            <option value="Bảo trì">Bảo trì</option>
            <option value="Thanh lý">Thanh lý</option>
          </select>
          <app-search-filter
            placeholder="Tìm tên, mã, serial..."
            (searchChanged)="onSearch($event)"
          ></app-search-filter>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px">STT</th>
              <th>Mã TS</th>
              <th>Ảnh</th>
              <th>Tên tài sản</th>
              <th>Danh mục</th>
              <th>Serial</th>
              <th>Người sử dụng</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            @for (asset of assets; track asset.assetId; let i = $index) {
              <tr>
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="font-weight-600">{{ asset.assetCode }}</td>
                <td>
                  @if (asset.imageUrl) {
                    <img [src]="'http://localhost:5188' + asset.imageUrl" class="asset-thumb" alt="Ảnh tài sản">
                  } @else {
                    <div class="asset-thumb-placeholder">
                      <span class="material-icons-round">image</span>
                    </div>
                  }
                </td>
                <td class="font-weight-600 text-primary">{{ asset.assetName }}</td>
                <td>{{ asset.categoryName || '-' }}</td>
                <td class="text-muted" style="font-size: 0.82rem;">{{ asset.serialNumber || '-' }}</td>
                <td>
                  @if (asset.assignedEmployeeName) {
                    <div>{{ asset.assignedEmployeeName }}</div>
                    <div class="text-muted" style="font-size: 0.78rem;">{{ asset.assignedEmployeeCode }}</div>
                  } @else {
                    <span class="text-muted">Chưa cấp phát</span>
                  }
                </td>
                <td>{{ asset.purchasePrice | number:'1.0-0' }} đ</td>
                <td>
                  <app-status-badge [status]="asset.status"></app-status-badge>
                </td>
                <td>
                  <div class="td-actions justify-end">
                    <button class="btn-icon-action text-warning" (click)="openUploadModal(asset)" title="Upload ảnh">
                      <span class="material-icons-round">photo_camera</span>
                    </button>
                    <button class="btn-icon-action text-info" (click)="openEditModal(asset)" title="Sửa">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon-action text-danger" (click)="deleteAsset(asset.assetId)" title="Xóa">
                      <span class="material-icons-round">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (assets.length === 0) {
              <tr>
                <td colspan="10" class="text-center py-5 text-muted">
                  <span class="material-icons-round" style="font-size: 3rem; opacity: 0.2">inventory_2</span>
                  <div class="mt-2">Không tìm thấy tài sản nào...</div>
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

    <!-- Modal Thêm/Sửa Tài sản -->
    @if (showModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Sửa Tài Sản' : 'Thêm Tài Sản' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <form [formGroup]="assetForm" (ngSubmit)="onSubmit()">
            <div class="modal-body">
              <div class="form-row">
                <div class="mb-3 form-col">
                  <label>Mã tài sản (*)</label>
                  <input type="text" formControlName="assetCode" class="form-control" [readonly]="isEditing">
                  @if (assetForm.get('assetCode')?.invalid && assetForm.get('assetCode')?.touched) {
                    <div class="error-message">Mã tài sản không được để trống.</div>
                  }
                </div>
                <div class="mb-3 form-col">
                  <label>Tên tài sản (*)</label>
                  <input type="text" formControlName="assetName" class="form-control">
                  @if (assetForm.get('assetName')?.invalid && assetForm.get('assetName')?.touched) {
                    <div class="error-message">Tên tài sản không được để trống.</div>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="mb-3 form-col">
                  <label>Danh mục (*)</label>
                  <select formControlName="categoryId" class="form-control">
                    <option value="">-- Chọn danh mục --</option>
                    @for (cat of allCategories; track cat.categoryId) {
                      <option [value]="cat.categoryId">{{ cat.categoryName }}</option>
                    }
                  </select>
                </div>
                <div class="mb-3 form-col">
                  <label>Trạng thái</label>
                  <select formControlName="status" class="form-control">
                    <option value="Sẵn sàng">Sẵn sàng</option>
                    <option value="Đang sử dụng">Đang sử dụng</option>
                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Thanh lý">Thanh lý</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="mb-3 form-col">
                  <label>Serial Number</label>
                  <input type="text" formControlName="serialNumber" class="form-control">
                </div>
                <div class="mb-3 form-col">
                  <label>Giá trị (VNĐ) (*)</label>
                  <input type="number" formControlName="purchasePrice" class="form-control">
                </div>
              </div>

              <div class="form-row">
                <div class="mb-3 form-col">
                  <label>Ngày mua</label>
                  <input type="date" formControlName="purchaseDate" class="form-control">
                </div>
                <div class="mb-3 form-col">
                  <label>Cấp phát cho NV (ID)</label>
                  <input type="number" formControlName="assignedToEmployeeId" class="form-control" placeholder="Để trống nếu chưa cấp phát">
                </div>
              </div>

              <div class="mb-3">
                <label>Mô tả</label>
                <textarea formControlName="description" class="form-control" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeModal()">Hủy</button>
              <button type="submit" class="btn-primary" [disabled]="assetForm.invalid">Lưu dữ liệu</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Upload Ảnh -->
    @if (showUploadModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <h3>Upload ảnh — {{ uploadAssetName }}</h3>
            <button class="btn-close" (click)="showUploadModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <div class="modal-body" style="text-align: center;">
            @if (previewUrl) {
              <img [src]="previewUrl" class="upload-preview" alt="Preview">
            } @else {
              <div class="upload-placeholder">
                <span class="material-icons-round" style="font-size: 4rem; color: var(--text-muted); opacity: 0.3;">cloud_upload</span>
                <p>Chọn file ảnh để xem trước</p>
              </div>
            }
            <input type="file" accept="image/*" (change)="onFileSelect($event)" class="form-control mt-3">
            <p class="text-muted mt-1" style="font-size: 0.78rem;">Chấp nhận: JPG, PNG, WEBP — Tối đa 5MB</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" (click)="showUploadModal = false">Hủy</button>
            <button type="button" class="btn-primary" [disabled]="!selectedFile" (click)="uploadImage()">
              <span class="material-icons-round">cloud_upload</span> Upload
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
    .text-warning { color: #f59e0b; }
    .text-muted { color: var(--text-secondary); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .justify-end { justify-content: flex-end; }
    .font-weight-600 { font-weight: 600; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .py-5 { padding-top: 40px; padding-bottom: 40px; }
    .mb-4 { margin-bottom: 16px; }

    .asset-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 2px solid var(--border-light); }
    .asset-thumb-placeholder { width: 48px; height: 48px; border-radius: 8px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; border: 2px dashed var(--border); }
    .asset-thumb-placeholder .material-icons-round { font-size: 1.2rem; color: var(--text-muted); opacity: 0.4; }

    .upload-preview { max-width: 280px; max-height: 200px; border-radius: 12px; border: 2px solid var(--border); object-fit: contain; }
    .upload-placeholder { padding: 24px; }
    .upload-placeholder p { margin-top: 8px; font-size: 0.85rem; }

    .form-row { display: flex; gap: 16px; }
    .form-col { flex: 1; }

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
    .btn-icon-action.text-warning:hover { background: rgba(245, 158, 11, 0.1); }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 5, 39, 0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
    .modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 100%; box-shadow: var(--shadow-xl); animation: slideUp 0.3s ease; overflow: hidden; max-height: 90vh; overflow-y: auto; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover); }
    .modal-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .btn-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); transition: color 0.2s; }
    .btn-close:hover { color: var(--danger); }
    
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: var(--bg-hover); }
    
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; transition: all 0.2s; outline: none; font-family: inherit; background: var(--bg-card); box-sizing: border-box; }
    .form-control:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px var(--primary-glow); }
    .form-control[readonly] { background: var(--bg-main); color: var(--text-secondary); cursor: not-allowed; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px; }

    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(67, 24, 255, 0.2); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(67, 24, 255, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .btn-outline { background: transparent; color: var(--text-primary); border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: var(--bg-hover); border-color: var(--text-secondary); }

    .mb-3 { margin-bottom: 1.2rem; }
    .error-message { color: var(--danger); font-size: 0.8rem; margin-top: 6px; font-weight: 500; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class AssetComponent implements OnInit {
  private assetService = inject(AssetService);
  private catService = inject(AssetCategoryService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);

  assets: Asset[] = [];
  allCategories: AssetCategory[] = [];

  // Pagination & Filter
  searchQuery = '';
  filterCategoryId: number | null = null;
  filterStatus = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  // Modal CRUD
  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  // Modal Upload
  showUploadModal = false;
  uploadAssetId: number | null = null;
  uploadAssetName = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  assetForm: FormGroup = this.fb.group({
    assetCode: ['', [Validators.required, Validators.maxLength(20)]],
    assetName: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    categoryId: ['', Validators.required],
    assignedToEmployeeId: [null],
    serialNumber: [''],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    purchaseDate: [''],
    status: ['Sẵn sàng']
  });

  ngOnInit() {
    this.loadCategories();
    this.loadAssets();
  }

  loadCategories() {
    this.catService.getAll().subscribe({
      next: (res) => {
        if (res.success) this.allCategories = res.data;
      }
    });
  }

  loadAssets() {
    this.assetService.getPaged(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.filterCategoryId ?? undefined,
      this.filterStatus || undefined
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.assets = res.data.items;
          this.totalItems = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => this.notif.error('Không thể tải danh sách tài sản')
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadAssets();
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterCategoryId = value ? parseInt(value) : null;
    this.currentPage = 1;
    this.loadAssets();
  }

  onStatusChange(event: Event) {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadAssets();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAssets();
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.assetForm.reset({ status: 'Sẵn sàng', purchasePrice: 0 });
    this.assetForm.get('assetCode')?.enable();
    this.showModal = true;
  }

  openEditModal(asset: Asset) {
    this.isEditing = true;
    this.editingId = asset.assetId;
    this.assetForm.patchValue({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      description: asset.description,
      categoryId: asset.categoryId.toString(),
      assignedToEmployeeId: asset.assignedToEmployeeId,
      serialNumber: asset.serialNumber,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      status: asset.status
    });
    this.assetForm.get('assetCode')?.disable();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.assetForm.invalid) return;
    const formData = this.assetForm.getRawValue();
    formData.categoryId = parseInt(formData.categoryId);
    if (!formData.assignedToEmployeeId) formData.assignedToEmployeeId = null;
    if (!formData.purchaseDate) formData.purchaseDate = null;

    const request = this.isEditing
      ? this.assetService.update(this.editingId!, formData)
      : this.assetService.create(formData);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadAssets();
          this.notif.success(this.isEditing ? 'Cập nhật tài sản thành công' : 'Thêm tài sản thành công');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notif.error(err.error?.message || 'Có lỗi xảy ra trên server');
      }
    });
  }

  deleteAsset(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
      this.assetService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.notif.success('Đã xóa tài sản');
            this.loadAssets();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.notif.error(err.error?.message || 'Không thể xóa tài sản');
        }
      });
    }
  }

  // === Upload Ảnh ===
  openUploadModal(asset: Asset) {
    this.uploadAssetId = asset.assetId;
    this.uploadAssetName = asset.assetName;
    this.selectedFile = null;
    this.previewUrl = asset.imageUrl ? 'http://localhost:5188' + asset.imageUrl : null;
    this.showUploadModal = true;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Preview ảnh trước khi upload
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage() {
    if (!this.selectedFile || !this.uploadAssetId) return;

    this.assetService.uploadImage(this.uploadAssetId, this.selectedFile).subscribe({
      next: (res) => {
        if (res.success) {
          this.notif.success('Upload ảnh thành công');
          this.showUploadModal = false;
          this.loadAssets();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notif.error(err.error?.message || 'Upload ảnh thất bại');
      }
    });
  }
}
