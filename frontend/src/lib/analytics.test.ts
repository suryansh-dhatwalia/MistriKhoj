import { describe, expect, it, vi } from 'vitest';
import { createAnalytics } from './analytics';

function setup(preview = false) {
  const post = vi.fn().mockResolvedValue({ data: { viewCount: 7 } });
  const timers: Array<() => void> = [];
  const analytics = createAnalytics({ post, isPreview: () => preview, schedule: (cb) => timers.push(cb) });
  return { post, analytics, flush: () => timers.splice(0).forEach((cb) => cb()) };
}

describe('analytics de-duplication', () => {
  it('counts a page view once per navigation (StrictMode double effects)', () => {
    const { post, analytics } = setup();
    analytics.trackPageView('k1', '/mistris', { state: 'assam' });
    analytics.trackPageView('k1', '/mistris', { state: 'assam' });
    expect(post).toHaveBeenCalledTimes(1);
    analytics.trackPageView('k2', '/', undefined);
    analytics.trackPageView('k1', '/mistris'); // coming back is a new view
    expect(post).toHaveBeenCalledTimes(3);
  });

  it('records one profile view per navigation and returns the new total', async () => {
    const { post, analytics } = setup();
    const [a, b] = await Promise.all([analytics.trackProfileView('k1', 5), analytics.trackProfileView('k1', 5)]);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/analytics/profile-view/5', {});
    expect([a, b]).toEqual([7, 7]);
  });

  it('batches impressions and sends each ad once per navigation', () => {
    const { post, analytics, flush } = setup();
    analytics.trackAdImpression('k1', 1, { state: 'assam' });
    analytics.trackAdImpression('k1', 1, { state: 'assam' });
    analytics.trackAdImpression('k1', 2, { state: 'assam' });
    flush();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/analytics/ad-impressions', { adIds: [1, 2], state: 'assam' });
  });

  it('records nothing during an admin preview', async () => {
    const { post, analytics, flush } = setup(true);
    analytics.trackPageView('k1', '/');
    analytics.trackAdImpression('k1', 1);
    expect(await analytics.trackProfileView('k1', 5)).toBeNull();
    flush();
    expect(post).not.toHaveBeenCalled();
  });

  it('swallows network failures', async () => {
    const post = vi.fn().mockRejectedValue(new Error('offline'));
    const analytics = createAnalytics({ post, isPreview: () => false, schedule: () => undefined });
    expect(await analytics.trackProfileView('k1', 5)).toBeNull();
  });
});
