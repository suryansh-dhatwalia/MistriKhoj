import { sameLocation } from "./location.js";

/**
 * Pure rules deciding where an advertisement may appear. Advertisement rows keep their
 * existing `placement` / `state` / `city` columns; the scope is derived from them so the
 * three can never disagree.
 */

export type AdScopeName = "HOME" | "STATE" | "CITY";
export type AdPlacementName = "HOME_BANNER" | "CATEGORY" | "VIDEO";
export type AdLifecycle = "LIVE" | "PAUSED" | "SCHEDULED" | "EXPIRED";

export interface AdTargetingFields {
  placement: AdPlacementName;
  state: string | null;
  city: string | null;
}

export interface AdScheduleFields {
  status: "ACTIVE" | "INACTIVE";
  startsAt: Date | null;
  endsAt: Date | null;
}

export interface ResultsContext {
  state?: string | null;
  city?: string | null;
  category?: string | null;
}

/** Scope an ad's placement/state/city imply, or null when it has no valid public slot. */
export function deriveAdScope(ad: AdTargetingFields): AdScopeName | null {
  if (ad.placement === "HOME_BANNER") return "HOME";
  if (ad.placement === "CATEGORY") {
    if (ad.state && ad.city) return "CITY";
    if (ad.state) return "STATE";
  }
  return null;
}

export function adLifecycle(ad: AdScheduleFields, now: Date): AdLifecycle {
  if (ad.status !== "ACTIVE") return "PAUSED";
  if (ad.startsAt && ad.startsAt.getTime() > now.getTime()) return "SCHEDULED";
  if (ad.endsAt && ad.endsAt.getTime() <= now.getTime()) return "EXPIRED";
  return "LIVE";
}

export interface CampaignFields {
  scope: AdScopeName;
  startsAt: Date | null;
  endsAt: Date | null;
}

function scheduleOf(ad: { status: "ACTIVE" | "INACTIVE" }, campaign: CampaignFields | null | undefined) {
  return { status: ad.status, startsAt: campaign?.startsAt ?? null, endsAt: campaign?.endsAt ?? null };
}

/** Homepage ad areas show only HOME ads that are live. */
export function isAdVisibleOnHome(
  ad: AdTargetingFields & { status: "ACTIVE" | "INACTIVE" },
  campaign: CampaignFields | null | undefined,
  now: Date,
): boolean {
  if (deriveAdScope(ad) !== "HOME") return false;
  if (campaign && campaign.scope !== "HOME") return false;
  return adLifecycle(scheduleOf(ad, campaign), now) === "LIVE";
}

/**
 * Results pages show STATE ads for their state and CITY ads only for their exact city.
 * A results page with no state (or a state-only browse for a CITY ad) shows no targeted ad.
 */
export function isAdVisibleOnResults(
  ad: AdTargetingFields & { status: "ACTIVE" | "INACTIVE"; category?: string | null },
  campaign: CampaignFields | null | undefined,
  context: ResultsContext,
  now: Date,
): boolean {
  const scope = deriveAdScope(ad);
  if (scope !== "STATE" && scope !== "CITY") return false;
  if (campaign && campaign.scope !== scope) return false;
  if (adLifecycle(scheduleOf(ad, campaign), now) !== "LIVE") return false;
  if (!sameLocation(ad.state, context.state)) return false;
  if (scope === "CITY" && !sameLocation(ad.city, context.city)) return false;
  if (ad.category && !sameLocation(ad.category, context.category)) return false;
  return true;
}

export interface AdTargetingInput {
  scope: AdScopeName;
  state?: string | null;
  city?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

/** Field -> message map; empty when the combination is valid. */
export function validateAdTargeting(input: AdTargetingInput): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const add = (field: string, message: string) => {
    (errors[field] ??= []).push(message);
  };

  if (input.scope === "STATE" && !input.state) add("state", "Choose the state this ad targets.");
  if (input.scope === "CITY") {
    if (!input.state) add("state", "Choose the state this ad targets.");
    if (!input.city) add("city", "A city-targeted ad needs a city.");
  }
  if (input.startsAt && input.endsAt && input.endsAt.getTime() <= input.startsAt.getTime()) {
    add("endsAt", "End date must be after the start date.");
  }
  return errors;
}

export interface AdRateCard {
  HOME: number;
  STATE: number;
  CITY: number;
}

/** Homepage visibility is the premium product: it must cost more than any targeted tier. */
export function validateAdRateCard(rates: AdRateCard): string | null {
  for (const [scope, value] of Object.entries(rates)) {
    if (!Number.isInteger(value) || value < 0 || value > 10_000_000) {
      return `${scope} price must be a whole number of rupees between 0 and 10,000,000.`;
    }
  }
  if (rates.HOME <= rates.STATE || rates.HOME <= rates.CITY) {
    return "Homepage/global ads must cost more than state-wide and city-specific ads.";
  }
  return null;
}
