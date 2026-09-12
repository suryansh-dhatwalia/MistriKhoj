import type React from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export type FieldDef =
  | {
      type: 'text' | 'textarea' | 'number';
      name: string;
      label: string;
      required?: boolean;
      helperText?: string;
      placeholder?: string;
      min?: number;
      max?: number;
      /** Show this field only when another field equals one of these values. */
      showWhen?: { field: string; equals: Array<string | number> };
    }
  | {
      type: 'select';
      name: string;
      label: string;
      options: SelectOption[];
      required?: boolean;
      helperText?: string;
      showWhen?: { field: string; equals: Array<string | number> };
    }
  | {
      type: 'asyncSelect';
      name: string;
      label: string;
      loadOptions: () => Promise<SelectOption[]>;
      required?: boolean;
      helperText?: string;
      allowEmpty?: boolean;
      showWhen?: { field: string; equals: Array<string | number> };
    }
  | {
      type: 'switch';
      name: string;
      label: string;
      helperText?: string;
      showWhen?: { field: string; equals: Array<string | number> };
    }
  | {
      type: 'image' | 'video';
      name: string;
      label: string;
      required?: boolean;
      helperText?: string;
      showWhen?: { field: string; equals: Array<string | number> };
    }
  | {
      type: 'stringList';
      name: string;
      label: string;
      helperText?: string;
      showWhen?: { field: string; equals: Array<string | number> };
    };

export interface ResourceApiLike<T> {
  list: (params?: Record<string, unknown>) => Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  }>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: number, data: Record<string, unknown>) => Promise<T>;
  remove: (id: number) => Promise<{ success: boolean; message?: string }>;
}
