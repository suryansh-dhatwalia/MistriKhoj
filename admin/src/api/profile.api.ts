import { api } from './client';
import { Admin, ChangePasswordInput, UpdateProfileInput } from '../types/admin.types';

export const profileApi = {
  /**
   * Update admin profile
   * PATCH /admin/profile
   */
  updateProfile: async (data: UpdateProfileInput): Promise<Admin> => {
    const response = await api.patch<{ success: boolean; admin: Admin }>('/admin/profile', data);
    return response.data.admin;
  },

  /**
   * Change admin password
   * PATCH /admin/profile/password
   */
  changePassword: async (data: ChangePasswordInput): Promise<{ message?: string }> => {
    const response = await api.patch<{ message?: string }>('/admin/profile/password', data);
    return response.data;
  },
};
