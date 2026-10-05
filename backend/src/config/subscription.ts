import type { PrismaClient } from "../../generated/prisma/client.js";

/**
 * Terms for the Mistri "Paid" plan. The price lives in the `site_settings` table
 * (key below) so an admin can change it from Site Settings; technicians cannot
 * change it. The paid top-listing always runs for exactly one year.
 */
export const PAID_PLAN_PRICE_SETTING_KEY = "paid_plan_price_inr";
export const DEFAULT_PAID_PLAN_PRICE_INR = 500;
export const PAID_PLAN_DURATION_DAYS = 365;

type SettingsClient = Pick<PrismaClient, "siteSetting">;

/** True for a whole, positive rupee amount that fits the DB column. */
export function isValidPaidPlanPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 1_000_000;
}

/** Current Paid-plan price in rupees; falls back to the default if unset or invalid. */
export async function getPaidPlanPriceInr(client: SettingsClient): Promise<number> {
  const row = await client.siteSetting.findUnique({ where: { key: PAID_PLAN_PRICE_SETTING_KEY } });
  return isValidPaidPlanPrice(row?.value) ? row.value : DEFAULT_PAID_PLAN_PRICE_INR;
}

/** Returns `startsAt + PAID_PLAN_DURATION_DAYS` as a new Date. */
export function paidPlanExpiryFrom(startsAt: Date): Date {
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + PAID_PLAN_DURATION_DAYS);
  return expiresAt;
}
