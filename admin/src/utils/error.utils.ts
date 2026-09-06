import axios, { AxiosError } from 'axios';

export interface ParsedApiError {
  message: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]> | Record<string, string> | string[] }>;
    
    // Check if network error or timeout
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        return {
          message: 'Request timed out. The server took too long to respond.',
          isNetworkError: true,
        };
      }
      return {
        message: 'Unable to reach backend server. Please verify the API server is running at ' + (import.meta.env.VITE_API_URL || 'http://localhost:3000/api') + '.',
        isNetworkError: true,
      };
    }

    const status = err.response.status;
    const data = err.response.data;

    let message = data?.message || data?.error || 'An unexpected error occurred';
    const fieldErrors: Record<string, string> = {};

    if (data?.errors) {
      if (Array.isArray(data.errors)) {
        message = data.errors.join(', ');
      } else if (typeof data.errors === 'object') {
        for (const [key, val] of Object.entries(data.errors)) {
          if (Array.isArray(val)) {
            fieldErrors[key] = val.join(', ');
          } else if (typeof val === 'string') {
            fieldErrors[key] = val;
          }
        }
      }
    }

    switch (status) {
      case 400:
        message = message || 'Validation failed. Please check the submitted details.';
        break;
      case 401:
        message = message || 'Session expired or invalid credentials. Please log in again.';
        break;
      case 403:
        message = message || 'Access denied. You do not have permission for this action.';
        break;
      case 404:
        message = message || 'The requested resource was not found.';
        break;
      case 409:
        message = message || 'Conflict detected. A record with this phone number or details already exists.';
        break;
      case 500:
      case 502:
      case 503:
        message = message || 'Server encountered an error. Please try again shortly.';
        break;
    }

    return {
      message,
      statusCode: status,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      isNetworkError: false,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      isNetworkError: false,
    };
  }

  return {
    message: 'An unknown error occurred.',
    isNetworkError: false,
  };
}
