import { api } from './client';
import { Admin, LoginRequest, LoginResponse } from '../types/admin.types';

export const authApi = {
  /**
   * Log in an administrator
   * POST /admin/auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/auth/login', credentials);
    return response.data;
  },

  /**
   * Get the current administrator session
   * GET /admin/auth/me
   */
  getCurrentAdmin: async (): Promise<Admin> => {
    const response = await api.get<{ admin?: Admin } | Admin>('/admin/auth/me');
    // Handle both { admin: Admin } or direct Admin object
    if (response.data && 'admin' in response.data && response.data.admin) {
      return response.data.admin;
    }
    return response.data as Admin;
  },

  /**
   * Log out the administrator
   * POST /admin/auth/logout
   */
  logout: async (): Promise<void> => {
    await api.post('/admin/auth/logout');
  },
};
