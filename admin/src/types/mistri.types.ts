export type MistriStatus = 'PENDING' | 'APPROVED';

export type MistriPlan = 'FREE' | 'PAID';

export interface Mistri {
  id: number;
  state: string;
  city: string;
  category: string;
  fullName: string;
  primaryPhone: string;
  alternatePhone: string | null;
  qualification: string;
  address: string;
  pincode: string | null;
  experienceYears: number;
  servicesOffered: string[];
  shortIntro: string | null;
  profilePhotoUrl: string;
  galleryImages: string[];
  referralCode: string | null;
  status: MistriStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  /** Subscription plan. Defaults to FREE. */
  plan?: MistriPlan;
  /** Snapshot price paid for the plan, in rupees (0 for FREE). */
  priceInr?: number;
  /** When the paid top slot started (set on approval), ISO string or null. */
  subscriptionStartsAt?: string | null;
  /** When the paid top slot expires, ISO string or null. */
  featuredUntil?: string | null;
  /** True while this Mistri currently holds the paid top slot for their area. */
  slotActive?: boolean;
}

export interface MistriQueryParams {
  status: MistriStatus;
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  city?: string;
  category?: string;
  plan?: MistriPlan;
  sortBy?: 'createdAt' | 'experienceYears' | 'fullName' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateMistriInput {
  fullName: string;
  primaryPhone: string;
  alternatePhone?: string | null;
  state: string;
  city: string;
  category: string;
  qualification: string;
  address: string;
  pincode?: string | null;
  experienceYears: number;
  servicesOffered: string[];
  shortIntro?: string | null;
  plan?: MistriPlan;
}

export interface RejectMistriInput {
  reason?: string;
}
