export type SupportedState =
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Maharashtra'
  | 'Meghalaya'
  | 'Nagaland'
  | 'Rajasthan'
  | 'Uttar Pradesh'
  | 'West Bengal';

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'as' // Assamese
  | 'gu' // Gujarati
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn'; // Kannada

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flagType: 'india' | 'bangla' | 'uk';
  shortCode: string;
}

export interface StateLocationInfo {
  name: SupportedState;
  code: string;
  regionalTitle: string;
  tagline: string;
  cities: string[];
  activeTechniciansCount: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  description: string;
  avgResponseTime: string;
  techniciansAvailable: number;
  popularServices: string[];
}

export type MistriPlan = 'FREE' | 'PAID';

export interface Technician {
  id: string;
  name: string;
  primaryPhone: string;
  alternatePhone?: string;
  state: SupportedState;
  city: string;
  category: string;
  qualification: string;
  address: string;
  experienceYears: number;
  servicesOffered: string[];
  intro: string;
  photoUrl: string;
  galleryImages: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  badgeLevel: 'Gold Master' | 'Silver Pro' | 'Platinum Partner' | 'Standard Verified' | 'New Registration';
  isEmergencyAvailable: boolean;
  startingPrice: number;
  completedJobs: number;
  policeVerified: boolean;
  skillTestCertified: boolean;
  memberSince: string;
  /** Subscription plan of the underlying registration. */
  plan: MistriPlan;
  /** True while this Mistri holds the paid top slot for their state + city + category. */
  isFeatured: boolean;
  /** ISO date the paid top slot expires, or null when not featured. */
  featuredUntil: string | null;
}

export interface SubscriptionPlan {
  id: 'free_starter' | 'silver_pro' | 'gold_master' | 'platinum_partner';
  name: string;
  price: string;
  duration: string;
  badge: string;
  highlighted?: boolean;
  popular?: boolean;
  features: string[];
  idealFor: string;
}

export interface MistriRegistrationFormData {
  state: SupportedState | '';
  city: string;
  category: string;
  fullName: string;
  primaryPhone: string;
  alternatePhone: string;
  qualification: string;
  address: string;
  pincode: string;
  experienceYears: number;
  servicesOffered: string[];
  customServiceInput: string;
  shortIntro: string;
  profilePhoto: string | null; // data URL or mock file
  galleryImages: string[]; // up to 3
  referralCode: string;
  subscriptionPlan: MistriPlan;
  acceptedTerms: boolean;
}

export interface TestimonialItem {
  id: string;
  author: string;
  location: string;
  state: string;
  rating: number;
  serviceCategory: string;
  technicianName: string;
  comment: string;
  date: string;
  avatarUrl: string;
}
export interface RegistrationGalleryImage {
  url: string;
  publicId: string | null;
}

export interface RegistrationApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    profilePhotoUrl: string;
    galleryImages: RegistrationGalleryImage[] | null;
    createdAt: string;
  };
}

export interface RegistrationApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface MistriListItem {
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
  createdAt: string;
  plan: MistriPlan;
  isFeatured: boolean;
  featuredUntil: string | null;
}

export interface PaidSlotStatusResponse {
  success: boolean;
  available: boolean;
  heldUntil: string | null;
  priceInr: number;
}

export interface MistriListApiResponse {
  success: boolean;
  data: MistriListItem[];
}
