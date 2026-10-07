import { api } from './api';

/**
 * Fire-and-forget analytics. Nothing here ever blocks rendering or throws into the UI,
 * and every event is de-duplicated per navigation, so React StrictMode's double-run
 * effects, re-renders and Vite hot reloads cannot count the same view twice.
 *
 * `navKey` is react-router's `location.key`: it changes on every real navigation and
 * stays the same across re-renders of one page view.
 */

export interface AdContext {
  state?: string;
  city?: string;
  category?: string;
}

export interface AnalyticsTransport {
  post: (path: string, body: unknown) => Promise<{ data?: unknown } | void>;
  isPreview: () => boolean;
  /** Replaceable timer so tests can flush the impression queue synchronously. */
  schedule: (callback: () => void, delayMs: number) => void;
}

const PREVIEW_STORAGE_KEY = 'mk_preview_session';

/** Admin previews (`?preview=admin`) are never counted — also for the rest of that tab's session. */
export function isPreviewSession(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('preview') === 'admin') {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(PREVIEW_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const contextKey = (context: AdContext) => `${context.state ?? ''}|${context.city ?? ''}|${context.category ?? ''}`;

export function createAnalytics(transport: AnalyticsTransport) {
  let activeNav = '';
  let lastPageViewKey = '';
  const profileViews = new Map<string, Promise<number | null>>();
  const impressionsSeen = new Set<string>();
  const pending = new Map<string, { context: AdContext; ids: Set<number> }>();
  let flushScheduled = false;

  // Dedupe only within one navigation: moving to another page (or coming back to this one
  // later) is a new view, but re-renders / StrictMode re-runs of the same page are not.
  const rotate = (navKey: string) => {
    if (navKey === activeNav) return;
    activeNav = navKey;
    profileViews.clear();
    impressionsSeen.clear();
  };

  const flush = () => {
    flushScheduled = false;
    const batches = [...pending.values()];
    pending.clear();
    for (const { context, ids } of batches) {
      void Promise.resolve(
        transport.post('/analytics/ad-impressions', { adIds: [...ids], ...context }),
      ).catch(() => undefined);
    }
  };

  return {
    /** Counts one page view per navigation. */
    trackPageView(navKey: string, path: string, location?: { state?: string; city?: string }): void {
      rotate(navKey);
      if (transport.isPreview() || navKey === lastPageViewKey) return;
      lastPageViewKey = navKey;
      void Promise.resolve(transport.post('/analytics/page-view', { path, ...location })).catch(() => undefined);
    },

    /**
     * Records a profile view once per navigation, only after the profile loaded successfully.
     * Resolves to the up-to-date total, or null when nothing came back.
     */
    trackProfileView(navKey: string, mistriId: number): Promise<number | null> {
      rotate(navKey);
      const key = `${navKey}:${mistriId}`;
      const existing = profileViews.get(key);
      if (existing) return existing;
      const request = transport.isPreview()
        ? Promise.resolve(null)
        : Promise.resolve(transport.post(`/analytics/profile-view/${mistriId}`, {}))
            .then((response) => {
              const total = (response as { data?: { viewCount?: unknown } } | undefined)?.data?.viewCount;
              return typeof total === 'number' ? total : null;
            })
            .catch(() => null);
      profileViews.set(key, request);
      return request;
    },

    /** Queues an ad impression (batched, once per ad per navigation). */
    trackAdImpression(navKey: string, adId: number, context: AdContext = {}): void {
      rotate(navKey);
      if (transport.isPreview()) return;
      const key = `${navKey}:${contextKey(context)}:${adId}`;
      if (impressionsSeen.has(key)) return;
      impressionsSeen.add(key);
      const bucket = pending.get(contextKey(context)) ?? { context, ids: new Set<number>() };
      bucket.ids.add(adId);
      pending.set(contextKey(context), bucket);
      if (!flushScheduled) {
        flushScheduled = true;
        transport.schedule(flush, 400);
      }
    },
  };
}

export const analytics = createAnalytics({
  post: (path, body) => api.post(path, body, { withCredentials: true }),
  isPreview: isPreviewSession,
  schedule: (callback, delayMs) => {
    window.setTimeout(callback, delayMs);
  },
});
