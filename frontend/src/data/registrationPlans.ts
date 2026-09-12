import type { MistriPlan } from '../types';

/**
 * The two plans a Mistri picks during registration. The Paid price is fixed here
 * (and again on the server) and cannot be changed by the technician.
 */
export const PAID_PLAN_PRICE_INR = 500;
export const PAID_PLAN_DURATION_LABEL = '1 year';

export interface RegistrationPlanOption {
  id: MistriPlan;
  name: string;
  price: string;
  priceNote: string;
  tagline: string;
  features: string[];
}

export const REGISTRATION_PLANS: RegistrationPlanOption[] = [
  {
    id: 'FREE',
    name: 'Free Plan',
    price: '₹0',
    priceNote: 'Always free',
    tagline: 'Standard listing in the Mistri directory for your city and trade.',
    features: [
      'Full verified profile with photo and gallery',
      'Direct phone & WhatsApp calls from customers',
      '0% commission on every job',
      'Appears in normal search order alongside other Mistris',
    ],
  },
  {
    id: 'PAID',
    name: 'Paid Plan',
    price: `₹${PAID_PLAN_PRICE_INR}`,
    priceNote: 'per year · fixed price',
    tagline: 'Pinned to the very top of search for your state + city + trade.',
    features: [
      'Top position for your city and category for 12 months',
      'Only one paid Mistri per area — reserve it before someone else does',
      'Everything in the Free plan, plus a “Top Listed” badge',
      'Position frees up for others once your year ends',
    ],
  },
];
