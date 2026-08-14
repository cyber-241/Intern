export interface Request {
  requestId: number;
  requestCode: string;
  requestType: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  reviewNote?: string;
  reviewedAt?: string;
  employeeName?: string;
  employeeCode?: string;
  reviewerName?: string;
  assetId?: number;
  assetCode?: string;
  assetName?: string;
}

export interface RequestCreate {
  requestType: string;
  title: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  assetId?: number | null;
  priority: string;
}

export interface RequestUpdateStatus {
  status: string;
  reviewNote?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
