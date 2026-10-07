export type AdScope = 'HOME' | 'STATE' | 'CITY';
export type AdLifecycle = 'LIVE' | 'PAUSED' | 'SCHEDULED' | 'EXPIRED';

export interface ManagedAd {
  id: number;
  title: string | null;
  companyName: string | null;
  description: string | null;
  ctaText: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaType: 'image' | 'video';
  scope: AdScope | null;
  needsTargeting: boolean;
  state: string | null;
  city: string | null;
  priceInr: number | null;
  startsAt: string | null;
  endsAt: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  lifecycle: AdLifecycle;
  impressions: number;
  sortOrder: number;
  createdAt: string;
}

export interface AdRateCard {
  HOME: number;
  STATE: number;
  CITY: number;
}

export interface AdListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  scope?: AdScope;
  lifecycle?: AdLifecycle;
  state?: string;
  city?: string;
  sortBy?: 'createdAt' | 'impressions' | 'priceInr' | 'title' | 'startsAt' | 'endsAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsOverview {
  range: { from: string; to: string };
  filters: { state: string | null; city: string | null };
  totals: {
    pageViews: number;
    uniqueVisitors: number | null;
    profileViews: number;
    adImpressions: number;
  };
  daily: Array<{
    day: string;
    pageViews: number;
    uniqueVisitors: number | null;
    profileViews: number;
    adImpressions: number;
  }>;
  byPage: Array<{ page: string; views: number }>;
  topProfiles: Array<{
    id: number;
    fullName: string;
    state: string;
    city: string;
    category: string;
    viewsInRange: number;
    viewsTotal: number;
  }>;
  ads: Array<{
    id: number;
    title: string | null;
    companyName: string | null;
    scope: AdScope | null;
    state: string | null;
    city: string | null;
    lifecycle: AdLifecycle;
    impressionsInRange: number;
    impressionsTotal: number;
  }>;
}
