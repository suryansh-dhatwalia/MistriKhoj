import { api } from './api';
import type { ServiceCategory, StateLocationInfo, SubscriptionPlan, TestimonialItem } from '../types';
import type { HomeAd } from '../data/ads';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

async function getData<T>(path: string): Promise<T> {
  const response = await api.get<ApiEnvelope<T>>(path);
  return response.data.data;
}

export interface VideoItem {
  id: number;
  title: string;
  link: string;
}

export const contentApi = {
  locations: () => getData<StateLocationInfo[]>('/content/locations'),
  categories: () => getData<ServiceCategory[]>('/content/categories'),
  homeAds: () => getData<Array<Record<string, unknown>>>('/content/ads?placement=HOME_BANNER'),
  videos: () => getData<VideoItem[]>('/content/videos'),
  testimonials: () => getData<TestimonialItem[]>('/content/testimonials'),
  plans: () => getData<SubscriptionPlan[]>('/content/plans'),
  settings: () => getData<Record<string, unknown>>('/content/settings'),
};

/** Normalises the API ad payload into the shape AdBannerSection expects. */
export function toHomeAd(raw: Record<string, unknown>): HomeAd {
  const imageUrl = (raw.imageUrl as string) || undefined;
  const videoUrl = (raw.videoUrl as string) || undefined;
  return {
    id: String(raw.id ?? crypto.randomUUID?.() ?? Math.random()),
    companyName: (raw.companyName as string) || 'Sponsored',
    title: (raw.title as string) || '',
    description: (raw.description as string) || '',
    imageUrl,
    videoUrl,
    ctaText: (raw.ctaText as string) || 'Learn More',
    link: (raw.linkUrl as string) || '#',
    type: videoUrl && !imageUrl ? 'video' : 'image',
  };
}
