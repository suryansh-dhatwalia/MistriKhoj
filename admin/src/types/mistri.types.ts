export type MistriStatus = 'PENDING' | 'APPROVED';

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
}

export interface MistriQueryParams {
  status: MistriStatus;
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  city?: string;
  category?: string;
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
}

export interface RejectMistriInput {
  reason?: string;
}
