export type ContentStatus = 'ACTIVE' | 'INACTIVE';
export type AdPlacement = 'HOME_BANNER' | 'CATEGORY' | 'VIDEO';

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ContentStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface StateItem {
  id: number;
  name: string;
  code: string;
  regionalTitle: string | null;
  tagline: string | null;
  activeTechniciansCount: number;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CityItem {
  id: number;
  stateId: number;
  name: string;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  state?: { id: number; name: string };
}

export interface CategoryItem {
  id: number;
  slug: string;
  name: string;
  hindiName: string | null;
  iconName: string | null;
  description: string | null;
  avgResponseTime: string | null;
  popularServices: string[];
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementItem {
  id: number;
  placement: AdPlacement;
  companyName: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  videoUrl: string | null;
  state: string | null;
  city: string | null;
  category: string | null;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialItem {
  id: number;
  author: string;
  location: string;
  state: string;
  rating: number;
  serviceCategory: string;
  technicianName: string;
  comment: string;
  displayDate: string;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlanItem {
  id: number;
  slug: string;
  name: string;
  price: string;
  duration: string;
  badge: string;
  features: string[];
  idealFor: string;
  highlighted: boolean;
  popular: boolean;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralItem {
  id: number;
  code: string;
  name: string;
  phone: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralLeadCount {
  code: string;
  count: number;
}

export interface ReferralMistriRow {
  id: number;
  fullName: string;
  primaryPhone: string;
  state: string;
  city: string;
  category: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
}

export type AdRequestStatus = 'NEW' | 'CONTACTED' | 'APPROVED' | 'REJECTED';

export interface AdRequestItem {
  id: number;
  companyName: string;
  contactNumber: string;
  email: string;
  adType: string;
  duration: string;
  targetUrl: string | null;
  creativeUrl: string | null;
  creativePublicId: string | null;
  message: string | null;
  status: AdRequestStatus;
  advertisementId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  label: string;
  settingGroup: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: unknown;
  createdAt: string;
  admin: { id: number; name: string; email: string } | null;
}

export interface AuditLogResponse {
  data: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: { actions: string[]; entityTypes: string[] };
}

export interface RankedRow {
  label: string;
  count: number;
}

export interface ReportsOverview {
  mistris: { pending: number; approved: number; total: number };
  registrationsByDay: Array<{ date: string; count: number }>;
  byState: RankedRow[];
  byCategory: RankedRow[];
  referralLeaderboard: Array<{ code: string; name: string | null; count: number }>;
  contentTotals: {
    states: number;
    cities: number;
    categories: number;
    ads: number;
    testimonials: number;
    plans: number;
    referrals: number;
  };
}
