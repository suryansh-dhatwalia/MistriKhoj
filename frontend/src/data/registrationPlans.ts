import type { MistriPlan } from '../types';

/**
 * The two plans a Mistri picks during registration. The Paid price is set by an
 * admin (Site Settings → paid_plan_price_inr); this is only the fallback used
 * before settings load. The server decides the real price.
 */
export const PAID_PLAN_PRICE_INR = 500;

export function resolvePaidPlanPrice(settings: Record<string, unknown>): number {
  const value = Number(settings.paid_plan_price_inr);
  return Number.isFinite(value) && value > 0 ? value : PAID_PLAN_PRICE_INR;
}
export const PAID_PLAN_DURATION_LABEL = '1 year';

export interface RegistrationPlanOption {
  id: MistriPlan;
  name: string;
  price: string;
  priceNote: string;
  tagline: string;
  features: string[];
}

export function getRegistrationPlans(paidPrice: number): RegistrationPlanOption[] {
  return REGISTRATION_PLANS.map((plan) =>
    plan.id === 'PAID' ? { ...plan, price: `₹${paidPrice}` } : plan,
  );
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
