import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Admin, LoginRequest } from '../types/admin.types';
import { authApi } from '../api/auth.api';
import { registerUnauthorizedHandler, unregisterUnauthorizedHandler } from '../api/client';
import { parseApiError } from '../utils/error.utils';

export interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  serverError: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  clearErrors: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setLoginError(null);
    setServerError(null);
  }, []);

  const handleUnauthorized = useCallback(() => {
    setAdmin(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(handleUnauthorized);
    return () => {
      unregisterUnauthorizedHandler();
    };
  }, [handleUnauthorized]);

  // Initial authentication check on application boot
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentAdmin = await authApi.getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch {
      // If 401 or any network failure, session is unauthenticated
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    clearErrors();
    try {
      const response = await authApi.login(credentials);
      if (response.admin) {
        setAdmin(response.admin);
      } else {
        // Fetch current admin if response didn't contain admin object
        const me = await authApi.getCurrentAdmin();
        setAdmin(me);
      }
      return true;
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isNetworkError) {
        setServerError(parsed.message);
      } else if (parsed.statusCode === 401 || parsed.statusCode === 400) {
        setLoginError(parsed.message || 'Invalid email or password.');
      } else {
        setServerError(parsed.message || 'Unable to log in. Please try again.');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
    }
  };

  const refreshAdmin = async () => {
    try {
      const updated = await authApi.getCurrentAdmin();
      setAdmin(updated);
    } catch (err) {
      console.error('Refresh admin error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        loginError,
        serverError,
        login,
        logout,
        refreshAdmin,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
