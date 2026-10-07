import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsDay,
  formatDay,
  isBotUserAgent,
  normalizePageKey,
  parseDayString,
  profileViewCountable,
  resolveDayRange,
  visitorHash,
} from "./analytics-core.js";

const CHROME =
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36";

test("analytics days follow the India calendar, not UTC", () => {
  // 20:00 UTC on 6 Oct is already 01:30 IST on 7 Oct.
  assert.equal(formatDay(analyticsDay(new Date("2026-10-06T20:00:00Z"))), "2026-10-07");
  assert.equal(formatDay(analyticsDay(new Date("2026-10-06T10:00:00Z"))), "2026-10-06");
});

test("parseDayString only accepts real YYYY-MM-DD dates", () => {
  assert.ok(parseDayString("2026-02-28"));
  assert.equal(parseDayString("2026-02-30"), null);
  assert.equal(parseDayString("07-10-2026"), null);
  assert.equal(parseDayString(undefined), null);
});

test("resolveDayRange defaults to 30 days, swaps a reversed range and caps at a year", () => {
  const now = new Date("2026-10-07T06:00:00Z");
  const fallback = resolveDayRange(undefined, undefined, now);
  assert.equal(formatDay(fallback.to), "2026-10-07");
  assert.equal(formatDay(fallback.from), "2026-09-08");

  const swapped = resolveDayRange("2026-10-05", "2026-10-01", now);
  assert.equal(formatDay(swapped.from), "2026-10-01");
  assert.equal(formatDay(swapped.to), "2026-10-05");

  const capped = resolveDayRange("2020-01-01", "2026-10-07", now);
  const days = (capped.to.getTime() - capped.from.getTime()) / 86_400_000 + 1;
  assert.equal(days, 366);
});

test("bots, scripted clients and missing user agents are not counted", () => {
  assert.equal(isBotUserAgent(CHROME), false);
  assert.equal(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
  assert.equal(isBotUserAgent("facebookexternalhit/1.1"), true);
  assert.equal(isBotUserAgent("curl/8.4.0"), true);
  assert.equal(isBotUserAgent("python-requests/2.31"), true);
  assert.equal(isBotUserAgent("Mozilla/5.0 HeadlessChrome/126.0"), true);
  assert.equal(isBotUserAgent(undefined), true);
  assert.equal(isBotUserAgent(""), true);
});

test("visitor hashes are stable within a day, differ across days and hide the raw IP", () => {
  const day = new Date("2026-10-07T00:00:00Z");
  const base = { secret: "s3cret", day, ip: "203.0.113.9", userAgent: CHROME };
  const hash = visitorHash(base);
  assert.equal(hash, visitorHash(base));
  assert.notEqual(hash, visitorHash({ ...base, day: new Date("2026-10-08T00:00:00Z") }));
  assert.notEqual(hash, visitorHash({ ...base, ip: "203.0.113.10" }));
  assert.notEqual(hash, visitorHash({ ...base, secret: "other" }));
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash.includes("203"), false);
});

test("only known page patterns are recorded", () => {
  assert.equal(normalizePageKey("/"), "/");
  assert.equal(normalizePageKey("/mistris?state=assam&city=guwahati"), "/mistris");
  assert.equal(normalizePageKey("/mistris/"), "/mistris");
  assert.equal(normalizePageKey("/mistri/42"), "/mistri/:id");
  assert.equal(normalizePageKey("/mistri/42?ref=x#top"), "/mistri/:id");
  assert.equal(normalizePageKey("/mistri/abc"), null);
  assert.equal(normalizePageKey("/wp-admin"), null);
  assert.equal(normalizePageKey("/" + "a".repeat(300)), null);
});

test("profile views inside the dedupe window do not count again", () => {
  const windowMs = 30 * 60 * 1000;
  const now = new Date("2026-10-07T10:00:00Z");
  assert.equal(profileViewCountable(null, now, windowMs), true);
  assert.equal(profileViewCountable(new Date("2026-10-07T09:45:00Z"), now, windowMs), false); // refresh
  assert.equal(profileViewCountable(new Date("2026-10-07T09:30:00Z"), now, windowMs), true); // exactly at the window
  assert.equal(profileViewCountable(new Date("2026-10-07T08:00:00Z"), now, windowMs), true);
});
