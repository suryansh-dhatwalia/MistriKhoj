import axios from 'axios';
import { api } from './api';
import type {
  MistriListApiResponse,
  MistriListItem,
  PublicLocations,
  RegistrationApiError,
} from '../types';
import { buildResultsQuery, RESULTS_PAGE_SIZE, type ResultsFilters } from './searchParams';

/** Human-readable message from any failed request. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<RegistrationApiError>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

const SEED_KEY = 'mk_shuffle_seed';

/** One random seed per browser session: a fresh order each visit, stable while paging. */
export function shuffleSeed(): string {
  try {
    let seed = sessionStorage.getItem(SEED_KEY);
    if (!seed) {
      seed = Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem(SEED_KEY, seed);
    }
    return seed;
  } catch {
    return 'default';
  }
}

export async function fetchMistriResults(
  filters: ResultsFilters,
  signal?: AbortSignal,
): Promise<MistriListApiResponse> {
  const query = buildResultsQuery({ ...filters, page: 1 });
  const params = new URLSearchParams(query);
  params.set('page', String(filters.page));
  params.set('pageSize', String(RESULTS_PAGE_SIZE));
  params.set('sort', filters.sort);
  if (filters.sort === 'random') params.set('seed', shuffleSeed());
  const response = await api.get<MistriListApiResponse>(`/mistris?${params.toString()}`, { signal });
  return response.data;
}

export async function fetchPublicLocations(signal?: AbortSignal): Promise<PublicLocations> {
  const response = await api.get<{ success: boolean; data: PublicLocations }>('/mistris/locations', { signal });
  return response.data.data;
}

export async function fetchMistriProfile(id: number, signal?: AbortSignal): Promise<MistriListItem> {
  const response = await api.get<{ success: boolean; data: MistriListItem }>(`/mistris/${id}`, { signal });
  return response.data.data;
}

export async function fetchTargetedAds(
  context: { state: string; city?: string; category?: string },
  signal?: AbortSignal,
): Promise<Array<Record<string, unknown>>> {
  const params = new URLSearchParams({ placement: 'CATEGORY', state: context.state });
  if (context.city) params.set('city', context.city);
  if (context.category) params.set('category', context.category);
  const response = await api.get<{ success: boolean; data: Array<Record<string, unknown>> }>(
    `/content/ads?${params.toString()}`,
    { signal },
  );
  return response.data.data;
}
