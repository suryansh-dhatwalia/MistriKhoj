import { SubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_starter',
    name: 'Starter Free Trial',
    price: '₹0',
    duration: 'First 30 Days Free',
    badge: 'Standard Starter',
    features: [
      'Basic listing in your registered city',
      'Receive up to 15 direct customer calls/mo',
      'Standard profile with 1 gallery photo',
      '0% commission on all earnings',
      'Standard SMS notifications'
    ],
    idealFor: 'New mistris trying the platform for the first time'
  },
  {
    id: 'silver_pro',
    name: 'Silver Pro',
    price: '₹299',
    duration: 'per month (or ₹799/quarter)',
    badge: 'Silver Pro Badge',
    features: [
      'Verified Silver Ustad Badge on profile',
      'Top 10 search priority in your city & category',
      'Receive up to 60 direct customer calls & WhatsApp',
      'Upload up to 3 gallery photos of past work',
      'Google Maps locality navigation enabled',
      'Dedicated helpline support'
    ],
    idealFor: 'Full-time technicians wanting steady daily customer calls'
  },
  {
    id: 'gold_master',
    name: 'Gold Master Ustad',
    price: '₹599',
    duration: 'per month (or ₹1,499/quarter)',
    badge: 'Gold Master Badge',
    highlighted: true,
    popular: true,
    features: [
      'Gold Master Ustad Verified Seal (2.5x more trust)',
      '#1 Top 3 Featured placement in state & city search',
      'Unlimited customer calls & direct WhatsApp connects',
      'Emergency 24/7 SOS alert lead broadcasts',
      'Full digital visiting card & QR code link',
      'Priority customer dispute resolution & support',
      'Zero lead fees forever'
    ],
    idealFor: 'Established master craftsmen & busy contractors'
  },
  {
    id: 'platinum_partner',
    name: 'Platinum Partner / Agency',
    price: '₹1,999',
    duration: 'per year (Save 45%)',
    badge: 'Platinum Partner',
    features: [
      'Exclusive Platinum Crown Verification Badge',
      'Multi-city coverage across your entire state',
      'Priority lead routing across all sub-categories',
      'Physical MistriKhoj laminated ID Card & Work Vest kit mailed to your address',
      'Commercial & contractor direct inquiry access',
      'Personal account manager for profile promotion',
      'SMS & WhatsApp marketing broadcast promotion'
    ],
    idealFor: 'Contractors, multi-worker teams & top-rated specialists'
  }
];
