export interface Admin {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  admin: Admin;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
