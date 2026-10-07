import type { AdLifecycle, AdScope } from '../types/ads.types';

export const SCOPE_LABEL: Record<AdScope, string> = {
  HOME: 'Homepage / global',
  STATE: 'State-wide',
  CITY: 'City-specific',
};

export const LIFECYCLE_COLOR: Record<AdLifecycle, 'success' | 'default' | 'info' | 'warning'> = {
  LIVE: 'success',
  PAUSED: 'default',
  SCHEDULED: 'info',
  EXPIRED: 'warning',
};

export interface AdFormValues {
  scope: AdScope;
  title: string;
  companyName: string;
  description: string;
  ctaText: string;
  linkUrl: string;
  state: string;
  city: string;
  priceInr: string;
  startsAt: string;
  endsAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  mediaType: 'image' | 'video';
  media: string;
}

/** Client-side mirror of the server rules, so invalid combinations never get submitted. */
export function validateAdForm(values: AdFormValues, isEdit: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.title.trim().length < 2) errors.title = 'Enter a headline.';
  if (values.scope !== 'HOME' && !values.state) errors.state = 'Choose the state this ad targets.';
  if (values.scope === 'CITY' && !values.city) errors.city = 'A city-targeted ad needs a city.';
  if (values.priceInr !== '' && !/^\d+$/.test(values.priceInr)) errors.priceInr = 'Whole rupees only.';
  if (values.linkUrl && !/^https:\/\//i.test(values.linkUrl)) errors.linkUrl = 'Use an https:// link.';
  if (values.startsAt && values.endsAt && new Date(values.endsAt) <= new Date(values.startsAt)) {
    errors.endsAt = 'End date must be after the start date.';
  }
  if (!values.media && !isEdit) errors.media = 'Upload an image or a video.';
  if (!values.media && isEdit) errors.media = 'Upload a replacement or keep the existing creative.';
  return errors;
}

/** `<input type="datetime-local">` value <-> ISO string. */
export const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const fromLocalInput = (value: string): string | null => (value ? new Date(value).toISOString() : null);

export function buildAdPayload(values: AdFormValues, existingMediaUrl: string | null): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    scope: values.scope,
    title: values.title.trim(),
    companyName: values.companyName,
    description: values.description,
    ctaText: values.ctaText,
    linkUrl: values.linkUrl,
    state: values.scope === 'HOME' ? '' : values.state,
    city: values.scope === 'CITY' ? values.city : '',
    priceInr: values.priceInr === '' ? undefined : Number(values.priceInr),
    startsAt: fromLocalInput(values.startsAt),
    endsAt: fromLocalInput(values.endsAt),
    status: values.status,
  };
  // An unchanged existing creative is not re-sent, so nothing is re-uploaded.
  if (values.media && values.media !== existingMediaUrl) {
    payload[values.mediaType === 'video' ? 'video' : 'image'] = values.media;
  }
  return payload;
}
