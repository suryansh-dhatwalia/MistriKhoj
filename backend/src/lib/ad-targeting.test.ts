import assert from "node:assert/strict";
import test from "node:test";
import {
  adLifecycle,
  deriveAdScope,
  isAdVisibleOnHome,
  isAdVisibleOnResults,
  validateAdRateCard,
  validateAdTargeting,
  type AdPlacementName,
} from "./ad-targeting.js";
import { isAdAllowedIn } from "./ad-visibility.js";

const NOW = new Date("2026-10-07T10:00:00Z");

const ad = (
  placement: AdPlacementName,
  state: string | null = null,
  city: string | null = null,
  status: "ACTIVE" | "INACTIVE" = "ACTIVE",
  category: string | null = null,
) => ({ placement, state, city, status, category });

const home = ad("HOME_BANNER");
const stateAd = ad("CATEGORY", "Assam");
const cityAd = ad("CATEGORY", "Assam", "Guwahati");

test("scope is derived from placement, state and city", () => {
  assert.equal(deriveAdScope(home), "HOME");
  assert.equal(deriveAdScope(stateAd), "STATE");
  assert.equal(deriveAdScope(cityAd), "CITY");
  assert.equal(deriveAdScope(ad("CATEGORY")), null); // legacy category ad with no state
  assert.equal(deriveAdScope(ad("VIDEO")), null);
});

test("homepage shows only homepage ads", () => {
  assert.equal(isAdVisibleOnHome(home, null, NOW), true);
  assert.equal(isAdVisibleOnHome(stateAd, null, NOW), false);
  assert.equal(isAdVisibleOnHome(cityAd, null, NOW), false);
});

test("results pages never show homepage ads", () => {
  assert.equal(isAdVisibleOnResults(home, null, { state: "Assam", city: "Guwahati" }, NOW), false);
});

test("a state ad shows across its state and nowhere else", () => {
  assert.equal(isAdVisibleOnResults(stateAd, null, { state: "assam" }, NOW), true);
  assert.equal(isAdVisibleOnResults(stateAd, null, { state: "Assam", city: "Jorhat" }, NOW), true);
  assert.equal(isAdVisibleOnResults(stateAd, null, { state: "Bihar" }, NOW), false);
  assert.equal(isAdVisibleOnResults(stateAd, null, {}, NOW), false);
});

test("a city ad shows only when exactly that city is browsed", () => {
  assert.equal(isAdVisibleOnResults(cityAd, null, { state: "Assam", city: "Guwahati" }, NOW), true);
  assert.equal(isAdVisibleOnResults(cityAd, null, { state: "assam", city: "guwahati" }, NOW), true);
  assert.equal(isAdVisibleOnResults(cityAd, null, { state: "Assam", city: "Jorhat" }, NOW), false);
  assert.equal(isAdVisibleOnResults(cityAd, null, { state: "Assam" }, NOW), false); // state-only browse
  assert.equal(isAdVisibleOnResults(cityAd, null, { state: "Bihar", city: "Guwahati" }, NOW), false);
});

test("a campaign whose scope disagrees with the ad is never shown", () => {
  const mismatch = { scope: "HOME" as const, startsAt: null, endsAt: null };
  assert.equal(isAdVisibleOnResults(cityAd, mismatch, { state: "Assam", city: "Guwahati" }, NOW), false);
  assert.equal(isAdVisibleOnHome(home, { scope: "CITY", startsAt: null, endsAt: null }, NOW), false);
});

test("paused, scheduled and expired ads are hidden", () => {
  const future = { scope: "HOME" as const, startsAt: new Date("2026-10-08T00:00:00Z"), endsAt: null };
  const past = { scope: "HOME" as const, startsAt: null, endsAt: new Date("2026-10-06T00:00:00Z") };
  const running = { scope: "HOME" as const, startsAt: new Date("2026-10-01T00:00:00Z"), endsAt: new Date("2026-10-31T00:00:00Z") };
  assert.equal(isAdVisibleOnHome(home, future, NOW), false);
  assert.equal(isAdVisibleOnHome(home, past, NOW), false);
  assert.equal(isAdVisibleOnHome(home, running, NOW), true);
  assert.equal(isAdVisibleOnHome(ad("HOME_BANNER", null, null, "INACTIVE"), null, NOW), false);
  assert.equal(adLifecycle({ status: "INACTIVE", startsAt: null, endsAt: null }, NOW), "PAUSED");
  assert.equal(adLifecycle({ status: "ACTIVE", ...{ startsAt: future.startsAt, endsAt: null } }, NOW), "SCHEDULED");
  assert.equal(adLifecycle({ status: "ACTIVE", startsAt: null, endsAt: past.endsAt }, NOW), "EXPIRED");
});

test("an ad with a category only shows for that category", () => {
  const electrician = ad("CATEGORY", "Assam", null, "ACTIVE", "Electrician");
  assert.equal(isAdVisibleOnResults(electrician, null, { state: "Assam", category: "electrician" }, NOW), true);
  assert.equal(isAdVisibleOnResults(electrician, null, { state: "Assam", category: "Plumber" }, NOW), false);
  assert.equal(isAdVisibleOnResults(electrician, null, { state: "Assam" }, NOW), false);
});

test("isAdAllowedIn routes a context to the right placement rules", () => {
  assert.equal(isAdAllowedIn(home, null, {}, NOW), true);
  assert.equal(isAdAllowedIn(home, null, { state: "Assam" }, NOW), false);
  assert.equal(isAdAllowedIn(stateAd, null, {}, NOW), false);
  assert.equal(isAdAllowedIn(stateAd, null, { state: "Assam" }, NOW), true);
});

test("invalid targeting combinations are rejected", () => {
  assert.deepEqual(validateAdTargeting({ scope: "HOME" }), {});
  assert.ok(validateAdTargeting({ scope: "STATE" }).state);
  assert.ok(validateAdTargeting({ scope: "CITY", state: "Assam" }).city);
  assert.ok(validateAdTargeting({ scope: "CITY", city: "Guwahati" }).state);
  assert.deepEqual(validateAdTargeting({ scope: "CITY", state: "Assam", city: "Guwahati" }), {});
  assert.ok(
    validateAdTargeting({
      scope: "HOME",
      startsAt: new Date("2026-10-10"),
      endsAt: new Date("2026-10-09"),
    }).endsAt,
  );
});

test("homepage ads must cost more than targeted ads", () => {
  assert.equal(validateAdRateCard({ HOME: 5000, STATE: 2000, CITY: 1000 }), null);
  assert.ok(validateAdRateCard({ HOME: 1000, STATE: 2000, CITY: 500 }));
  assert.ok(validateAdRateCard({ HOME: 1000, STATE: 500, CITY: 1000 }));
  assert.ok(validateAdRateCard({ HOME: 5000, STATE: -1, CITY: 100 }));
});
