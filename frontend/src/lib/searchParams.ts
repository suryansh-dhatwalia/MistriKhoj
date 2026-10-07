/**
 * The search-results page keeps its whole state in the URL so a refresh or a shared
 * link shows exactly the same list:  /mistris?state=assam&city=guwahati&category=electrician
 * This module is pure (no React, no DOM) so the URL <-> filters mapping can be unit-tested.
 */

export type ResultsSort = 'random' | 'newest' | 'rating' | 'experience';

export interface ResultsFilters {
  /** Location slug, e.g. "uttar-pradesh". Empty = any. */
  state: string;
  city: string;
  category: string;
  q: string;
  minExp: number;
  sort: ResultsSort;
  page: number;
}

export const DEFAULT_RESULTS_FILTERS: ResultsFilters = {
  state: '',
  city: '',
  category: '',
  q: '',
  minExp: 0,
  sort: 'random',
  page: 1,
};

export const RESULTS_PAGE_SIZE = 12;

/** "Uttar Pradesh" -> "uttar-pradesh". Mirrors the backend so names and slugs are interchangeable. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

const SORTS: ResultsSort[] = ['random', 'newest', 'rating', 'experience'];

function positiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

/** Reads filters from the URL, tolerating missing, junk or hand-edited values. */
export function parseResultsParams(params: URLSearchParams): ResultsFilters {
  const sort = params.get('sort') as ResultsSort | null;
  const city = slugify(params.get('city') ?? '');
  const state = slugify(params.get('state') ?? '');
  return {
    state,
    // A city only means something together with its state.
    city: state ? city : '',
    category: slugify(params.get('category') ?? ''),
    q: (params.get('q') ?? '').trim().slice(0, 100),
    minExp: positiveInt(params.get('minExp'), 0, 80),
    sort: sort && SORTS.includes(sort) ? sort : 'random',
    page: Math.max(1, positiveInt(params.get('page'), 1, 10_000)),
  };
}

/** Builds the query string for a filter set, leaving out every value that is still a default. */
export function buildResultsQuery(filters: Partial<ResultsFilters>): string {
  const merged = { ...DEFAULT_RESULTS_FILTERS, ...filters };
  const params = new URLSearchParams();
  const state = slugify(merged.state);
  if (state) params.set('state', state);
  if (state && merged.city) params.set('city', slugify(merged.city));
  if (merged.category) params.set('category', slugify(merged.category));
  if (merged.q.trim()) params.set('q', merged.q.trim());
  if (merged.minExp > 0) params.set('minExp', String(merged.minExp));
  if (merged.sort !== DEFAULT_RESULTS_FILTERS.sort) params.set('sort', merged.sort);
  if (merged.page > 1) params.set('page', String(merged.page));
  return params.toString();
}

export function buildResultsPath(filters: Partial<ResultsFilters>): string {
  const query = buildResultsQuery(filters);
  return query ? `/mistris?${query}` : '/mistris';
}

/** "guwahati" -> "Guwahati", used only while the real name has not loaded yet. */
export function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface ResultsHeadingParts {
  category?: string;
  city?: string;
  state?: string;
}

/** "Electricians in Guwahati, Assam" / "Mistris in Assam" / "All Mistris". */
export function resultsHeading({ category, city, state }: ResultsHeadingParts): string {
  const place = [city, state].filter(Boolean).join(', ');
  const what = category ? category : 'Mistris';
  if (place) return `${what} in ${place}`;
  return category ? what : 'All Mistris';
}
