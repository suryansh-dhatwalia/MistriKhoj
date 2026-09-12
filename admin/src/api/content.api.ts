import { api } from './client';
import { PaginatedApiResponse } from '../types/api.types';
import {
  AdRequestItem,
  AdvertisementItem,
  AuditLogResponse,
  CategoryItem,
  CityItem,
  ListQuery,
  PlanItem,
  ReferralItem,
  ReferralLeadCount,
  ReferralMistriRow,
  ReportsOverview,
  SiteSetting,
  StateItem,
  TestimonialItem,
} from '../types/content.types';

export interface ResourceApi<T> {
  list: (params?: ListQuery) => Promise<PaginatedApiResponse<T>>;
  get: (id: number) => Promise<T>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: number, data: Record<string, unknown>) => Promise<T>;
  remove: (id: number) => Promise<{ success: boolean; message?: string }>;
}

function createResourceApi<T>(basePath: string): ResourceApi<T> {
  return {
    list: async (params) => {
      const response = await api.get<PaginatedApiResponse<T>>(basePath, { params });
      return response.data;
    },
    get: async (id) => {
      const response = await api.get<{ success: boolean; data: T }>(`${basePath}/${id}`);
      return response.data.data;
    },
    create: async (data) => {
      const response = await api.post<{ success: boolean; data: T }>(basePath, data);
      return response.data.data;
    },
    update: async (id, data) => {
      const response = await api.patch<{ success: boolean; data: T }>(`${basePath}/${id}`, data);
      return response.data.data;
    },
    remove: async (id) => {
      const response = await api.delete<{ success: boolean; message?: string }>(`${basePath}/${id}`);
      return response.data;
    },
  };
}

export const statesApi = createResourceApi<StateItem>('/admin/states');
export const citiesApi = createResourceApi<CityItem>('/admin/cities');
export const categoriesApi = createResourceApi<CategoryItem>('/admin/categories');
export const advertisementsApi = createResourceApi<AdvertisementItem>('/admin/advertisements');
export const testimonialsApi = createResourceApi<TestimonialItem>('/admin/testimonials');
export const plansApi = createResourceApi<PlanItem>('/admin/plans');
export const referralsApi = createResourceApi<ReferralItem>('/admin/referrals');
export const adRequestsApi = createResourceApi<AdRequestItem>('/admin/ad-requests');

export const referralExtrasApi = {
  leadCounts: async (): Promise<ReferralLeadCount[]> => {
    const response = await api.get<{ success: boolean; data: ReferralLeadCount[] }>(
      '/admin/referrals/lead-counts',
    );
    return response.data.data;
  },
  mistris: async (
    id: number,
    params?: { page?: number; pageSize?: number },
  ): Promise<PaginatedApiResponse<ReferralMistriRow> & { referral: { id: number; code: string; name: string } }> => {
    const response = await api.get(`/admin/referrals/${id}/mistris`, { params });
    return response.data;
  },
};

export const reportsApi = {
  overview: async (): Promise<ReportsOverview> => {
    const response = await api.get<{ success: boolean; data: ReportsOverview }>('/admin/reports/overview');
    return response.data.data;
  },
};

export const auditApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    action?: string;
    entityType?: string;
  }): Promise<AuditLogResponse> => {
    const response = await api.get<AuditLogResponse & { success: boolean }>('/admin/audit-logs', { params });
    return response.data;
  },
};

export const settingsApi = {
  list: async (): Promise<SiteSetting[]> => {
    const response = await api.get<{ success: boolean; data: SiteSetting[] }>('/admin/settings');
    return response.data.data;
  },
  update: async (settings: Array<{ key: string; value: unknown }>): Promise<SiteSetting[]> => {
    const response = await api.patch<{ success: boolean; data: SiteSetting[] }>('/admin/settings', {
      settings,
    });
    return response.data.data;
  },
};
