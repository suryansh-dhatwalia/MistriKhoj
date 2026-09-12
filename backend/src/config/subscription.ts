/**
 * Fixed terms for the Mistri "Paid" plan. These are deliberately constants, not
 * env vars or admin-editable settings: the price the technician sees at
 * registration must not be changeable by the user, and the paid top-listing
 * always runs for exactly one year.
 */
export const PAID_PLAN_PRICE_INR = 500;
export const PAID_PLAN_DURATION_DAYS = 365;

/** Returns `startsAt + PAID_PLAN_DURATION_DAYS` as a new Date. */
export function paidPlanExpiryFrom(startsAt: Date): Date {
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + PAID_PLAN_DURATION_DAYS);
  return expiresAt;
}
