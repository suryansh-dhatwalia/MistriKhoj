import { avatarOrDefault } from './avatar';
import type { MistriListItem, SupportedState, Technician } from '../types';

/** Maps an API Mistri onto the shape the cards and profile page render. */
export const toTechnician = (mistri: MistriListItem): Technician => ({
  id: `MST-${String(mistri.id).padStart(6, '0')}`,
  name: mistri.fullName,
  primaryPhone: mistri.primaryPhone,
  alternatePhone: mistri.alternatePhone || undefined,
  state: mistri.state as SupportedState,
  city: mistri.city,
  category: mistri.category,
  qualification: mistri.qualification,
  address: `${mistri.address}${mistri.pincode ? `, PIN - ${mistri.pincode}` : ''}`,
  experienceYears: mistri.experienceYears,
  servicesOffered: mistri.servicesOffered,
  intro:
    mistri.shortIntro ||
    `${mistri.category} providing services in ${mistri.city}, ${mistri.state}.`,
  photoUrl: avatarOrDefault(mistri.profilePhotoUrl),
  galleryImages: mistri.galleryImages,
  rating: mistri.avgRating ?? 0,
  reviewsCount: mistri.ratingsCount ?? 0,
  isVerified: false,
  badgeLevel: 'New Registration',
  startingPrice: 0,
  completedJobs: 0,
  skillTestCertified: false,
  memberSince: mistri.createdAt,
  plan: mistri.plan ?? 'FREE',
  isFeatured: Boolean(mistri.isFeatured),
  featuredUntil: mistri.featuredUntil ?? null,
});

/** "MST-000123" -> 123 (the raw id the API expects). */
export const toMistriNumericId = (formattedId: string): number => Number(formattedId.replace(/^MST-/, ''));

/** Opens the phone dialer or WhatsApp for a Mistri. */
export function contactTechnician(tech: Technician, method: 'phone' | 'whatsapp'): void {
  const rawNumber = tech.primaryPhone.replace(/\D/g, '');
  if (method === 'phone') {
    window.location.href = `tel:${rawNumber}`;
    return;
  }
  const message = encodeURIComponent(
    `Hello ${tech.name}, I found your profile on MistriKhoj for ${tech.category} services in ${tech.city}. Are you available for a site visit/repair?`,
  );
  window.open(`https://wa.me/${rawNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
}
