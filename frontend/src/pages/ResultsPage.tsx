import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Megaphone, RotateCcw, Search, Wrench } from 'lucide-react';
import { AdGrid } from '../components/AdGrid';
import { MistriCard } from '../components/MistriCard';
import { useContent } from '../context/ContentContext';
import { useLocations } from '../context/LocationsContext';
import type { HomeAd } from '../data/ads';
import { toHomeAd } from '../lib/content.api';
import { apiErrorMessage, fetchMistriResults, fetchTargetedAds } from '../lib/mistri.api';
import { usePageMeta } from '../lib/seo';
import {
  buildResultsPath,
  parseResultsParams,
  prettifySlug,
  resultsHeading,
  slugify,
  type ResultsFilters,
  type ResultsSort,
} from '../lib/searchParams';
import { contactTechnician, toTechnician } from '../lib/technician';
import type { MistriListApiResponse } from '../types';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; response: MistriListApiResponse };

const selectClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-900 focus:border-black focus:outline-none disabled:opacity-50';
const labelClass = 'mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500';

/** Page numbers around the current one, with gaps shown as `null`. */
function pageWindow(current: number, total: number): Array<number | null> {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | null> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) out.push(null);
    out.push(page);
  });
  return out;
}

export const ResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseResultsParams(searchParams), [searchParams]);
  const { categories } = useContent();
  const { locations } = useLocations();
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [ads, setAds] = useState<HomeAd[]>([]);
  const [queryText, setQueryText] = useState(filters.q);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => setQueryText(filters.q), [filters.q]);

  // Results: refetched whenever any filter in the URL changes (including a refresh or shared link).
  useEffect(() => {
    const controller = new AbortController();
    setLoad({ status: 'loading' });
    fetchMistriResults(filters, controller.signal)
      .then((response) => setLoad({ status: 'ready', response }))
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        setLoad({ status: 'error', message: apiErrorMessage(error, 'Could not load Mistris. Please try again.') });
      });
    return () => controller.abort();
  }, [filters, reloadToken]);

  // Location-targeted ads: only for a browsed state; failures never block the results.
  useEffect(() => {
    if (!filters.state) {
      setAds([]);
      return;
    }
    const controller = new AbortController();
    fetchTargetedAds(
      { state: filters.state, city: filters.city || undefined, category: filters.category || undefined },
      controller.signal,
    )
      .then((rows) => setAds(rows.map(toHomeAd)))
      .catch(() => setAds([]));
    return () => controller.abort();
  }, [filters.state, filters.city, filters.category]);

  const response = load.status === 'ready' ? load.response : null;
  const stateName = response?.location.state ?? (filters.state ? prettifySlug(filters.state) : '');
  const cityName = response?.location.city ?? (filters.city ? prettifySlug(filters.city) : '');
  const categoryName =
    categories.find((category) => slugify(category.name) === filters.category)?.name ??
    (filters.category ? prettifySlug(filters.category) : '');
  const heading = resultsHeading({ category: categoryName, city: cityName, state: stateName });
  const place = [cityName, stateName].filter(Boolean).join(', ');
  const empty = response !== null && response.data.length === 0;

  usePageMeta({
    title: heading,
    description: `Find verified ${categoryName || 'mistris, electricians, plumbers and carpenters'}${
      place ? ` in ${place}` : ' across India'
    }. Call or WhatsApp directly — 0% commission.`,
    canonicalPath: buildResultsPath({ ...filters, page: filters.page }),
    noindex: load.status === 'error' || empty,
  });

  const update = useCallback(
    (patch: Partial<ResultsFilters>) => {
      const next = { ...filters, page: 1, ...patch };
      if (patch.state !== undefined && patch.state !== filters.state && patch.city === undefined) next.city = '';
      setSearchParams(new URLSearchParams(buildResultsPath(next).split('?')[1] ?? ''));
    },
    [filters, setSearchParams],
  );

  const goToPage = (page: number) => {
    update({ page });
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stateEntry = locations.states.find((state) => slugify(state.name) === filters.state);
  const showingFrom = response && response.total > 0 ? (response.page - 1) * response.pageSize + 1 : 0;
  const showingTo = response ? Math.min(response.page * response.pageSize, response.total) : 0;
  const hasFilters = Boolean(filters.state || filters.category || filters.q || filters.minExp);

  return (
    <div className="border-b border-gray-200 bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-black hover:underline">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Mistris</span>
          {stateName && (
            <>
              <span aria-hidden="true"> / </span>
              <span>{stateName}</span>
            </>
          )}
        </nav>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-black tracking-tight text-[#111827] outline-none sm:text-4xl md:text-5xl"
        >
          {heading}
        </h1>
        <p className="mt-2 text-xs font-medium text-gray-600 sm:text-sm" aria-live="polite" role="status">
          {load.status === 'loading'
            ? 'Loading Mistris…'
            : response && response.total > 0
              ? `Showing ${showingFrom}–${showingTo} of ${response.total} registered Mistris`
              : ''}
        </p>

        {/* Refine */}
        <form
          role="search"
          aria-label="Refine Mistri search"
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: queryText.trim() });
          }}
          className="mt-6 space-y-3 rounded-2xl border-2 border-gray-900 bg-white p-3 sm:p-4"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label htmlFor="res-state" className={labelClass}>State</label>
              <select
                id="res-state"
                className={selectClass}
                value={filters.state}
                onChange={(event) => update({ state: event.target.value, city: '' })}
              >
                <option value="">All states</option>
                {locations.states.map((state) => (
                  <option key={state.slug} value={state.slug}>{state.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="res-city" className={labelClass}>City</label>
              <select
                id="res-city"
                className={selectClass}
                value={filters.city}
                disabled={!filters.state}
                onChange={(event) => update({ city: event.target.value })}
              >
                <option value="">{filters.state ? 'All cities' : 'Choose a state first'}</option>
                {(stateEntry?.cities ?? []).map((city) => (
                  <option key={city.slug} value={city.slug}>{city.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="res-category" className={labelClass}>Category</label>
              <select
                id="res-category"
                className={selectClass}
                value={filters.category}
                onChange={(event) => update({ category: event.target.value })}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={slugify(category.name)}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="res-exp" className={labelClass}>Experience</label>
              <select
                id="res-exp"
                className={selectClass}
                value={filters.minExp}
                onChange={(event) => update({ minExp: Number(event.target.value) })}
              >
                <option value={0}>Any</option>
                <option value={5}>5+ years</option>
                <option value={10}>10+ years</option>
                <option value={15}>15+ years</option>
              </select>
            </div>
            <div>
              <label htmlFor="res-sort" className={labelClass}>Sort by</label>
              <select
                id="res-sort"
                className={selectClass}
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as ResultsSort })}
              >
                <option value="random">Shuffled (fair for all)</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest rating</option>
                <option value="experience">Most experienced</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="res-q" className={labelClass}>Search</label>
              <div className="flex gap-1.5">
                <input
                  id="res-q"
                  type="search"
                  value={queryText}
                  onChange={(event) => setQueryText(event.target.value)}
                  placeholder="Name or service"
                  className={`${selectClass} min-w-0`}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="shrink-0 rounded-xl bg-[#FFB800] px-3 text-black hover:bg-[#F59E0B]"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {hasFilters && (
            <Link
              to="/mistris"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-bold text-black hover:bg-gray-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset filters
            </Link>
          )}
        </form>

        {/* Location-targeted sponsors */}
        {ads.length > 0 && (
          <section className="mt-8" aria-label={`Sponsored in ${place || 'this area'}`}>
            <div className="mb-3 flex items-center gap-2 text-gray-500">
              <Megaphone className="h-4 w-4 text-[#FFB800]" aria-hidden="true" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Sponsored in {place || 'this area'}</h2>
            </div>
            <AdGrid
              ads={ads}
              context={{ state: filters.state, city: filters.city, category: filters.category }}
              ariaLabel={`Advertisements for ${place}`}
            />
          </section>
        )}

        {/* Results */}
        <div className="mt-8" aria-busy={load.status === 'loading'}>
          {load.status === 'loading' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl border-2 border-gray-200 bg-white" />
              ))}
            </div>
          ) : load.status === 'error' ? (
            <div role="alert" className="rounded-2xl border-2 border-red-200 bg-white px-4 py-16 text-center">
              <Wrench className="mx-auto mb-3 h-12 w-12 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-black">Unable to load Mistris</h2>
              <p className="mt-1 text-xs text-red-700">{load.message}</p>
              <button
                type="button"
                onClick={() => setReloadToken((token) => token + 1)}
                className="mt-4 cursor-pointer rounded-xl bg-[#FFB800] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#F59E0B]"
              >
                Try Again
              </button>
            </div>
          ) : empty ? (
            <div className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-16 text-center">
              <Wrench className="mx-auto mb-3 h-12 w-12 text-gray-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-black">
                {filters.state && !response?.location.state
                  ? `We don't have Mistris in ${stateName} yet`
                  : 'No Mistris found for these filters'}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs font-medium text-gray-500">
                Try a different city or category, or browse every registered Mistri.
              </p>
              <Link
                to="/mistris"
                className="mt-4 inline-block rounded-xl bg-[#FFB800] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#F59E0B]"
              >
                Browse all Mistris
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
                {response!.data.map((mistri) => (
                  <li key={mistri.id} className="min-w-0">
                    <MistriCard tech={toTechnician(mistri)} onDirectContact={contactTechnician} />
                  </li>
                ))}
              </ul>

              {response!.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={response!.page <= 1}
                    onClick={() => goToPage(response!.page - 1)}
                    className="flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                  </button>
                  {pageWindow(response!.page, response!.totalPages).map((page, index) =>
                    page === null ? (
                      <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        aria-label={`Page ${page}`}
                        aria-current={page === response!.page ? 'page' : undefined}
                        className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold ${
                          page === response!.page ? 'bg-black text-[#FFB800]' : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={response!.page >= response!.totalPages}
                    onClick={() => goToPage(response!.page + 1)}
                    className="flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

