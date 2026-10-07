import { api } from './client';
import type { PaginatedApiResponse } from '../types/api.types';
import type { AdListQuery, AdRateCard, AnalyticsOverview, ManagedAd } from '../types/ads.types';

export const adsApi = {
  list: async (params: AdListQuery): Promise<PaginatedApiResponse<ManagedAd>> =>
    (await api.get<PaginatedApiResponse<ManagedAd>>('/admin/ads', { params })).data,
  create: async (data: Record<string, unknown>): Promise<ManagedAd> =>
    (await api.post<{ data: ManagedAd }>('/admin/ads', data)).data.data,
  update: async (id: number, data: Record<string, unknown>): Promise<ManagedAd> =>
    (await api.patch<{ data: ManagedAd }>(`/admin/ads/${id}`, data)).data.data,
  setStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ManagedAd> =>
    (await api.patch<{ data: ManagedAd }>(`/admin/ads/${id}/status`, { status })).data.data,
  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/ads/${id}`);
  },
  getRateCard: async (): Promise<AdRateCard> =>
    (await api.get<{ data: AdRateCard }>('/admin/ads/rate-card')).data.data,
  saveRateCard: async (rates: AdRateCard): Promise<AdRateCard> =>
    (await api.put<{ data: AdRateCard }>('/admin/ads/rate-card', rates)).data.data,
};

export const analyticsApi = {
  overview: async (params: { from?: string; to?: string; state?: string; city?: string }): Promise<AnalyticsOverview> =>
    (await api.get<{ data: AnalyticsOverview }>('/admin/analytics/overview', { params })).data.data,
};
