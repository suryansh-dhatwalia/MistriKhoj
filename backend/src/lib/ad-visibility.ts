import {
  isAdVisibleOnHome,
  isAdVisibleOnResults,
  type AdPlacementName,
  type AdScopeName,
  type ResultsContext,
} from "./ad-targeting.js";

interface AdRow {
  placement: AdPlacementName;
  state: string | null;
  city: string | null;
  category: string | null;
  status: "ACTIVE" | "INACTIVE";
}
interface CampaignRow {
  scope: AdScopeName;
  startsAt: Date | null;
  endsAt: Date | null;
}

/**
 * True when `ad` may be shown in the given context: the homepage when no state is
 * given, otherwise the results page for that state (and city).
 */
export function isAdAllowedIn(
  ad: AdRow,
  campaign: CampaignRow | null,
  context: ResultsContext,
  now: Date,
): boolean {
  return context.state
    ? isAdVisibleOnResults(ad, campaign, context, now)
    : isAdVisibleOnHome(ad, campaign, now);
}
