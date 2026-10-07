import type { PrismaClient } from "../../generated/prisma/client.js";
import type { AdRateCard, AdScopeName } from "../lib/ad-targeting.js";

/**
 * Rate card for advertisements, stored in `site_settings` (group "advertising") so an
 * admin can change it from Settings. Homepage/global ads are the premium tier.
 */
export const AD_PRICE_SETTING_KEYS: Record<AdScopeName, string> = {
  HOME: "ad_price_home_inr",
  STATE: "ad_price_state_inr",
  CITY: "ad_price_city_inr",
};

export const DEFAULT_AD_RATE_CARD: AdRateCard = { HOME: 5000, STATE: 2000, CITY: 1000 };

const LABELS: Record<AdScopeName, string> = {
  HOME: "Ad price - Homepage / global (₹)",
  STATE: "Ad price - State-wide results (₹)",
  CITY: "Ad price - City-specific results (₹)",
};

type SettingsClient = Pick<PrismaClient, "siteSetting">;

const isPrice = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

export async function getAdRateCard(client: SettingsClient): Promise<AdRateCard> {
  const rows = await client.siteSetting.findMany({
    where: { key: { in: Object.values(AD_PRICE_SETTING_KEYS) } },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const read = (scope: AdScopeName) => {
    const value = byKey.get(AD_PRICE_SETTING_KEYS[scope]);
    return isPrice(value) ? value : DEFAULT_AD_RATE_CARD[scope];
  };
  return { HOME: read("HOME"), STATE: read("STATE"), CITY: read("CITY") };
}

/** Creates any missing rate-card rows (never overwrites an admin's value). */
export async function ensureAdRateCardSettings(client: SettingsClient): Promise<void> {
  for (const scope of Object.keys(AD_PRICE_SETTING_KEYS) as AdScopeName[]) {
    await client.siteSetting.upsert({
      where: { key: AD_PRICE_SETTING_KEYS[scope] },
      update: {},
      create: {
        key: AD_PRICE_SETTING_KEYS[scope],
        value: DEFAULT_AD_RATE_CARD[scope],
        label: LABELS[scope],
        settingGroup: "advertising",
      },
    });
  }
}
