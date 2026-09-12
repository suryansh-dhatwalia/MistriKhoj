import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ServiceCategory, StateLocationInfo, SubscriptionPlan, TestimonialItem } from '../types';
import { SUPPORTED_STATES as STATIC_STATES } from '../data/locations';
import { SERVICE_CATEGORIES as STATIC_CATEGORIES } from '../data/categories';
import { TESTIMONIALS as STATIC_TESTIMONIALS } from '../data/testimonials';
import { SUBSCRIPTION_PLANS as STATIC_PLANS } from '../data/plans';
import { SAMPLE_ADS, type HomeAd } from '../data/ads';
import { contentApi, toHomeAd, type VideoItem } from '../lib/content.api';

// Demo sponsored content is useful locally, but production must never show a
// sample advertiser when the CMS is unavailable.
const FALLBACK_ADS = import.meta.env.DEV ? SAMPLE_ADS : [];

interface ContentContextValue {
  states: StateLocationInfo[];
  categories: ServiceCategory[];
  testimonials: TestimonialItem[];
  plans: SubscriptionPlan[];
  homeAds: HomeAd[];
  videos: VideoItem[];
  settings: Record<string, unknown>;
  getCitiesForState: (stateName: string) => string[];
  /** 'live' once at least one slice loaded from the API, otherwise 'fallback'. */
  source: 'fallback' | 'live';
  loading: boolean;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<StateLocationInfo[]>(STATIC_STATES);
  const [categories, setCategories] = useState<ServiceCategory[]>(STATIC_CATEGORIES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(STATIC_TESTIMONIALS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(STATIC_PLANS);
  const [homeAds, setHomeAds] = useState<HomeAd[]>(FALLBACK_ADS);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [source, setSource] = useState<'fallback' | 'live'>('fallback');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const nonEmpty = <T,>(value: T[], fallback: T[]) => (value && value.length > 0 ? value : fallback);

    Promise.allSettled([
      contentApi.locations(),
      contentApi.categories(),
      contentApi.testimonials(),
      contentApi.plans(),
      contentApi.homeAds(),
      contentApi.videos(),
      contentApi.settings(),
    ]).then((results) => {
      if (!active) return;
      let anyLive = false;
      const [loc, cat, test, plan, ads, vids, sett] = results;

      if (loc.status === 'fulfilled') {
        anyLive = true;
        setStates(nonEmpty(loc.value as StateLocationInfo[], STATIC_STATES));
      }
      if (cat.status === 'fulfilled') {
        anyLive = true;
        setCategories(nonEmpty(cat.value as ServiceCategory[], STATIC_CATEGORIES));
      }
      if (test.status === 'fulfilled') {
        anyLive = true;
        setTestimonials(nonEmpty(test.value as TestimonialItem[], STATIC_TESTIMONIALS));
      }
      if (plan.status === 'fulfilled') {
        anyLive = true;
        setPlans(nonEmpty(plan.value as SubscriptionPlan[], STATIC_PLANS));
      }
      if (ads.status === 'fulfilled') {
        anyLive = true;
        const mapped = (ads.value as Array<Record<string, unknown>>).map(toHomeAd);
        setHomeAds(nonEmpty(mapped, FALLBACK_ADS));
      }
      if (vids.status === 'fulfilled') {
        anyLive = true;
        setVideos(vids.value as VideoItem[]);
      }
      if (sett.status === 'fulfilled') {
        anyLive = true;
        setSettings((sett.value as Record<string, unknown>) ?? {});
      }

      if (anyLive) setSource('live');
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const getCitiesForState = useCallback(
    (stateName: string) => states.find((state) => state.name === stateName)?.cities ?? [],
    [states],
  );

  const value = useMemo<ContentContextValue>(
    () => ({
      states,
      categories,
      testimonials,
      plans,
      homeAds,
      videos,
      settings,
      getCitiesForState,
      source,
      loading,
    }),
    [states, categories, testimonials, plans, homeAds, videos, settings, getCitiesForState, source, loading],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = (): ContentContextValue => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
