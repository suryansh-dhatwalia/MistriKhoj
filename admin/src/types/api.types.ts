import { Mistri } from './mistri.types';

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface DashboardStatistics {
  pendingRegistrations: number;
  approvedMistris: number;
  totalMistris: number;
  todayRegistrations: number;
  recentPending?: Mistri[];
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]> | string[];
}
