import { createHash } from "node:crypto";

/**
 * Pure helpers behind the analytics endpoints (no database, no env), so they can be
 * unit-tested directly. Nothing here ever sees or keeps a raw IP address beyond the
 * moment it is hashed.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Analytics days are Asia/Kolkata calendar days, stored as a UTC-midnight Date for a DATE column. */
export function analyticsDay(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

export function formatDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}

/** Parses a strict `YYYY-MM-DD` string into a UTC-midnight Date, or null. */
export function parseDayString(value: string | undefined | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || formatDay(date) !== value ? null : date;
}

export const MAX_RANGE_DAYS = 366;
export const DEFAULT_RANGE_DAYS = 30;

export interface DayRange {
  from: Date;
  to: Date;
}

/**
 * Resolves an optional from/to pair into an inclusive day range. Defaults to the last
 * 30 days (today included), swaps a reversed pair, and caps the span at a year.
 */
export function resolveDayRange(
  from: string | undefined,
  to: string | undefined,
  now: Date = new Date(),
): DayRange {
  const today = analyticsDay(now);
  let end = parseDayString(to) ?? today;
  let start = parseDayString(from) ?? new Date(end.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
  if (start.getTime() > end.getTime()) [start, end] = [end, start];
  const earliest = new Date(end.getTime() - (MAX_RANGE_DAYS - 1) * DAY_MS);
  if (start.getTime() < earliest.getTime()) start = earliest;
  return { from: start, to: end };
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl\/|wget|python-requests|httpclient|okhttp|axios|node-fetch|go-http-client|java\//i;

/** Crawlers, link-preview fetchers, monitors and scripted clients are never counted. */
export function isBotUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent || userAgent.trim().length < 10) return true;
  return BOT_PATTERN.test(userAgent);
}

export function visitorHash(input: {
  secret: string;
  day: Date;
  ip: string;
  userAgent: string;
}): string {
  return createHash("sha256")
    .update(`${input.secret}|${formatDay(input.day)}|${input.ip}|${input.userAgent}`)
    .digest("hex");
}

export const PAGE_KEYS = ["/", "/mistris", "/mistri/:id", "/register", "/advertise"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

/**
 * Maps a browser path onto one of the known page patterns. Anything else returns
 * null and is ignored, so the endpoint cannot be used to write arbitrary strings.
 */
export function normalizePageKey(path: string | undefined | null): PageKey | null {
  if (!path || path.length > 200) return null;
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (clean === "/" || clean === "/mistris" || clean === "/register" || clean === "/advertise") {
    return clean as PageKey;
  }
  return /^\/mistri\/\d{1,9}$/.test(clean) ? "/mistri/:id" : null;
}

/** True when a visitor's previous counted view is old enough for a new one to count. */
export function profileViewCountable(
  lastCountedAt: Date | null | undefined,
  now: Date,
  windowMs: number,
): boolean {
  if (!lastCountedAt) return true;
  return now.getTime() - lastCountedAt.getTime() >= windowMs;
}
