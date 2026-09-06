import { api } from './client';
import { DashboardStatistics } from '../types/api.types';

export const dashboardApi = {
  /**
   * Get dashboard statistics and recent pending registrations
   * GET /admin/dashboard
   */
  getStatistics: async (): Promise<DashboardStatistics> => {
    const response = await api.get<{ success: boolean; data: DashboardStatistics }>('/admin/dashboard');
    return response.data.data;
  },
};
