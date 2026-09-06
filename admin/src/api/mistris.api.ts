import { api } from './client';
import {
  Mistri,
  MistriQueryParams,
  RejectMistriInput,
  UpdateMistriInput,
} from '../types/mistri.types';
import { PaginatedApiResponse } from '../types/api.types';

export const mistrisApi = {
  /**
   * Get list of Mistris with filtering and pagination
   * GET /admin/mistris
   */
  getMistris: async (params: MistriQueryParams): Promise<PaginatedApiResponse<Mistri>> => {
    const response = await api.get<PaginatedApiResponse<Mistri>>('/admin/mistris', { params });
    return response.data;
  },

  /**
   * Get single Mistri details by ID
   * GET /admin/mistris/:id
   */
  getMistriById: async (id: number): Promise<Mistri> => {
    const response = await api.get<{ success: boolean; data: Mistri }>(`/admin/mistris/${id}`);
    return response.data.data;
  },

  /**
   * Update Mistri registration details
   * PATCH /admin/mistris/:id
   */
  updateMistri: async (id: number, data: UpdateMistriInput): Promise<Mistri> => {
    const response = await api.patch<{ success: boolean; data: Mistri }>(`/admin/mistris/${id}`, data);
    return response.data.data;
  },

  /**
   * Approve a pending Mistri registration
   * PATCH /admin/mistris/:id/approve
   */
  approveMistri: async (id: number): Promise<{ success: boolean; message: string; mistri: Mistri }> => {
    const response = await api.patch<{ success: boolean; message: string; mistri: Mistri }>(
      `/admin/mistris/${id}/approve`
    );
    return response.data;
  },

  /**
   * Reject and permanently delete a Mistri registration
   * DELETE /admin/mistris/:id
   */
  rejectAndDeleteMistri: async (id: number, data?: RejectMistriInput): Promise<{ message?: string }> => {
    const response = await api.delete<{ message?: string }>(`/admin/mistris/${id}`, {
      data: data || {},
    });
    return response.data;
  },
};
