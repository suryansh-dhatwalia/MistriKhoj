import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseApiError } from '../../utils/error.utils';
import type { ResourceApiLike } from './resourceConfig';

interface UseResourceListOptions {
  pageSize?: number;
  /** Fixed query params merged into every request (e.g. a locked `placement`). */
  fixedParams?: Record<string, unknown>;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export interface ResourceListState<T> {
  rows: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: '' | 'ACTIVE' | 'INACTIVE';
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: { message: string; isNetworkError: boolean } | null;
  setPage: (page: number) => void;
  setSearch: (value: string) => void;
  setStatusFilter: (value: '' | 'ACTIVE' | 'INACTIVE') => void;
  setSort: (field: string) => void;
  refresh: () => void;
}

export function useResourceList<T>(
  api: ResourceApiLike<T>,
  options: UseResourceListOptions = {},
): ResourceListState<T> {
  const { pageSize = 10, fixedParams, defaultSortBy, defaultSortOrder = 'asc' } = options;
  const fixedParamsKey = JSON.stringify(fixedParams ?? {});

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState('');
  const [statusFilter, setStatusFilterValue] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isNetworkError: boolean } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const resolvedFixedParams = useMemo(
    () => (fixedParams ? { ...fixedParams } : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fixedParamsKey],
  );

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.list({
        ...resolvedFixedParams,
        page,
        pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
      setRows(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages ?? Math.max(1, Math.ceil(response.total / pageSize)));
    } catch (err) {
      const parsed = parseApiError(err);
      setError({ message: parsed.message, isNetworkError: parsed.isNetworkError });
    } finally {
      setIsLoading(false);
    }
  }, [api, resolvedFixedParams, page, pageSize, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRows, reloadToken]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setStatusFilter = useCallback((value: '' | 'ACTIVE' | 'INACTIVE') => {
    setStatusFilterValue(value);
    setPage(1);
  }, []);

  const setSort = useCallback((field: string) => {
    setSortBy((currentField) => {
      if (currentField === field) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
        return currentField;
      }
      setSortOrder('asc');
      return field;
    });
    setPage(1);
  }, []);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    rows,
    total,
    totalPages,
    page,
    pageSize,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    isLoading,
    error,
    setPage,
    setSearch,
    setStatusFilter,
    setSort,
    refresh,
  };
}
