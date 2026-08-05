import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchFilterComponent } from '../../shared/components/search-filter/search-filter.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AssetCategoryService } from '../../services/asset-category.service';
import { AssetCategory } from '../../models/data.model';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-asset-category',
  standalone: true,
  imports: [ReactiveFormsModule, SearchFilterComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="material-icons-round text-primary">category</span>
          Danh mục tài sản
        </div>
      </div>

      <div class="toolbar mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button class="btn-primary" (click)="openAddModal()">
          <span class="material-icons-round">add</span> Thêm Danh Mục
        </button>
        <app-search-filter
          placeholder="Tìm theo mã, tên danh mục..."
          (searchChanged)="onSearch($event)"
        ></app-search-filter>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px">STT</th>
              <th>Mã DM</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th style="width: 100px">Số tài sản</th>
              <th>Trạng thái</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            @for (cat of categories; track cat.categoryId; let i = $index) {
              <tr>
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="font-weight-600">{{ cat.categoryCode }}</td>
                <td class="font-weight-600 text-primary">{{ cat.categoryName }}</td>
                <td class="text-muted">{{ cat.description || '-' }}</td>
                <td>
                  <span class="asset-count-badge">{{ cat.assetCount ?? 0 }}</span>
                </td>
                <td>
                  <app-status-badge [status]="cat.isActive ? 'Hoạt động' : 'Ngừng hoạt động'"></app-status-badge>
                </td>
                <td>
                  <div class="td-actions justify-end">
                    <button class="btn-icon-action text-info" (click)="openEditModal(cat)" title="Sửa">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon-action text-danger" (click)="deleteCategory(cat.categoryId)" title="Xóa">
                      <span class="material-icons-round">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (categories.length === 0) {
              <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                  <span class="material-icons-round" style="font-size: 3rem; opacity: 0.2">category</span>
                  <div class="mt-2">Không tìm thấy danh mục nào...</div>
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

    <!-- Modal Thêm/Sửa Danh Mục -->
    @if (showModal) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Sửa Danh Mục' : 'Thêm Danh Mục' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <form [formGroup]="catForm" (ngSubmit)="onSubmit()">
            <div class="modal-body">
              <div class="mb-3">
                <label>Mã danh mục (*)</label>
                <input type="text" formControlName="categoryCode" class="form-control" [readonly]="isEditing">
                @if (catForm.get('categoryCode')?.invalid && catForm.get('categoryCode')?.touched) {
                  <div class="error-message">Mã danh mục không được để trống (tối đa 20 ký tự).</div>
                }
              </div>

              <div class="mb-3">
                <label>Tên danh mục (*)</label>
                <input type="text" formControlName="categoryName" class="form-control">
                @if (catForm.get('categoryName')?.invalid && catForm.get('categoryName')?.touched) {
                  <div class="error-message">Tên danh mục không được để trống.</div>
                }
              </div>

              <div class="mb-3">
                <label>Mô tả</label>
                <textarea formControlName="description" class="form-control" rows="3"></textarea>
              </div>

              <div class="mb-3" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" formControlName="isActive" id="catActiveCheck">
                <label for="catActiveCheck" style="margin: 0; cursor: pointer;">Danh mục đang hoạt động</label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeModal()">Hủy</button>
              <button type="submit" class="btn-primary" [disabled]="catForm.invalid">Lưu dữ liệu</button>
            </div>
          </form>
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

    .asset-count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; border-radius: 14px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: white; font-size: 0.8rem; font-weight: 700; padding: 0 8px; }

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

    .mb-3 { margin-bottom: 1.2rem; }
    .error-message { color: var(--danger); font-size: 0.8rem; margin-top: 6px; font-weight: 500; }
  `]
})
export class AssetCategoryComponent implements OnInit {
  private catService = inject(AssetCategoryService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);

  categories: AssetCategory[] = [];
  
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  catForm: FormGroup = this.fb.group({
    categoryCode: ['', [Validators.required, Validators.maxLength(20)]],
    categoryName: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    isActive: [true]
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.catService.getPaged(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data.items;
          this.totalItems = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => this.notif.error('Không thể tải danh sách danh mục')
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadCategories();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCategories();
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.catForm.reset({ isActive: true });
    this.catForm.get('categoryCode')?.enable();
    this.showModal = true;
  }

  openEditModal(cat: AssetCategory) {
    this.isEditing = true;
    this.editingId = cat.categoryId;
    this.catForm.patchValue({
      categoryCode: cat.categoryCode,
      categoryName: cat.categoryName,
      description: cat.description,
      isActive: cat.isActive
    });
    this.catForm.get('categoryCode')?.disable();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.catForm.invalid) return;
    const formData = this.catForm.getRawValue();

    const request = this.isEditing
      ? this.catService.update(this.editingId!, formData)
      : this.catService.create(formData);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadCategories();
          this.notif.success(this.isEditing ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notif.error(err.error?.message || 'Có lỗi xảy ra trên server');
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.catService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.notif.success(res.message || 'Đã xóa danh mục');
            this.loadCategories();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.notif.error(err.error?.message || 'Không thể xóa danh mục');
        }
      });
    }
  }
}
