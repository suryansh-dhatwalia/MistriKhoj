import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { sameLocation, slugify } from "../lib/location.js";
import { shuffleRank } from "../lib/shuffle.js";
import type { PublicMistriQuery } from "../schemas/directory.schema.js";

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function toGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "url" in item && typeof item.url === "string") {
      return [item.url];
    }
    return [];
  });
}

const publicMistriSelect = {
  id: true,
  state: true,
  city: true,
  category: true,
  fullName: true,
  primaryPhone: true,
  alternatePhone: true,
  qualification: true,
  address: true,
  pincode: true,
  experienceYears: true,
  servicesOffered: true,
  shortIntro: true,
  profilePhotoUrl: true,
  galleryImages: true,
  createdAt: true,
} as const;

/** Ids an admin has hidden from the public site. They stay APPROVED but are never listed. */
async function hiddenMistriIds(): Promise<number[]> {
  const inactive = await prisma.mistriAvailability.findMany({
    where: { status: "INACTIVE" },
    select: { mistriId: true },
  });
  return inactive.map((row) => row.mistriId);
}

export interface PublicLocations {
  total: number;
  states: Array<{
    name: string;
    slug: string;
    count: number;
    cities: Array<{ name: string; slug: string; count: number }>;
  }>;
}

/** States / cities that currently have at least one live Mistri, with counts. */
export async function loadPublicLocations(): Promise<PublicLocations> {
  const hidden = await hiddenMistriIds();
  const grouped = await prisma.mistri.groupBy({
    by: ["state", "city"],
    where: { status: "APPROVED", ...(hidden.length > 0 ? { id: { notIn: hidden } } : {}) },
    _count: { _all: true },
  });

  const states = new Map<string, PublicLocations["states"][number]>();
  let total = 0;
  for (const row of grouped) {
    total += row._count._all;
    const key = slugify(row.state);
    const entry = states.get(key) ?? { name: row.state, slug: key, count: 0, cities: [] };
    entry.count += row._count._all;
    const cityKey = slugify(row.city);
    const existingCity = entry.cities.find((city) => city.slug === cityKey);
    if (existingCity) existingCity.count += row._count._all;
    else entry.cities.push({ name: row.city, slug: cityKey, count: row._count._all });
    states.set(key, entry);
  }

  const sorted = [...states.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const state of sorted) state.cities.sort((a, b) => a.name.localeCompare(b.name));
  return { total, states: sorted };
}

type PublicMistriRow = Prisma.MistriGetPayload<{ select: typeof publicMistriSelect }>;

/**
 * Adds the paid "top listed" flag and the rating aggregate. Subscriptions and ratings
 * have no Prisma relation to Mistri, so they are joined here by id.
 */
async function enrich(mistris: PublicMistriRow[]) {
  if (mistris.length === 0) return [];
  const ids = mistris.map((mistri) => mistri.id);
  const now = Date.now();

  const [paidSubscriptions, ratingAggregates] = await Promise.all([
    prisma.mistriSubscription.findMany({
      where: { mistriId: { in: ids }, plan: "PAID" },
      select: { mistriId: true, expiresAt: true },
    }),
    prisma.mistriRating.groupBy({
      by: ["mistriId"],
      where: { mistriId: { in: ids }, status: "ACTIVE" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const featuredUntilByMistriId = new Map<number, Date>();
  for (const subscription of paidSubscriptions) {
    if (subscription.expiresAt && subscription.expiresAt.getTime() > now) {
      featuredUntilByMistriId.set(subscription.mistriId, subscription.expiresAt);
    }
  }
  const ratingByMistriId = new Map(
    ratingAggregates.map((row) => [row.mistriId, { avg: row._avg.rating ?? 0, count: row._count.rating }]),
  );

  return mistris.map((mistri) => {
    const featuredUntil = featuredUntilByMistriId.get(mistri.id) ?? null;
    const ratingInfo = ratingByMistriId.get(mistri.id);
    return {
      ...mistri,
      servicesOffered: toStringArray(mistri.servicesOffered),
      galleryImages: toGalleryUrls(mistri.galleryImages),
      plan: featuredUntil ? ("PAID" as const) : ("FREE" as const),
      isFeatured: featuredUntil != null,
      featuredUntil: featuredUntil ? featuredUntil.toISOString() : null,
      avgRating: ratingInfo ? Math.round(ratingInfo.avg * 10) / 10 : 0,
      ratingsCount: ratingInfo?.count ?? 0,
    };
  });
}

export type PublicMistri = Awaited<ReturnType<typeof enrich>>[number];

/** Case/space-insensitive text match used for the free-text search box. */
function matchesQuery(mistri: PublicMistri, query: string): boolean {
  const needle = query.toLowerCase();
  const haystacks = [
    mistri.fullName,
    mistri.city,
    mistri.state,
    mistri.category,
    mistri.qualification,
    mistri.shortIntro,
    ...mistri.servicesOffered,
  ];
  return haystacks.some((value) => typeof value === "string" && value.toLowerCase().includes(needle));
}

export interface PublicMistriPage {
  data: PublicMistri[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Canonical names the `state` / `city` filters resolved to (null when nothing matched). */
  location: { state: string | null; city: string | null };
}

/**
 * The public directory query. State and city are matched by slug so shareable URLs such
 * as `?state=uttar-pradesh&city=gorakhpur` resolve to the stored names. Paid "top listed"
 * Mistris are always pinned first; `sort` orders within each group.
 */
export async function queryPublicMistris(query: PublicMistriQuery): Promise<PublicMistriPage> {
  const hidden = await hiddenMistriIds();
  const baseWhere = { status: "APPROVED" as const, ...(hidden.length > 0 ? { id: { notIn: hidden } } : {}) };

  const location: PublicMistriPage["location"] = { state: null, city: null };
  const where: Record<string, unknown> = { ...baseWhere };
  let unresolved = false;

  if (query.state || query.city) {
    const grouped = await prisma.mistri.groupBy({ by: ["state", "city"], where: baseWhere });
    if (query.state) {
      const match = grouped.find((row) => sameLocation(row.state, query.state));
      if (match) {
        location.state = match.state;
        where.state = match.state;
      } else unresolved = true;
    }
    if (query.city && !unresolved) {
      const match = grouped.find(
        (row) => sameLocation(row.city, query.city) && (!location.state || row.state === location.state),
      );
      if (match) {
        location.city = match.city;
        where.city = match.city;
        if (!location.state) {
          location.state = match.state;
          where.state = match.state;
        }
      } else unresolved = true;
    }
  }

  const page = query.page ?? 1;
  const paginated = query.page !== undefined || query.pageSize !== undefined;
  const pageSize = query.pageSize ?? 12;

  if (unresolved) {
    return { data: [], total: 0, page, pageSize, totalPages: 1, location };
  }

  if (query.minExp) where.experienceYears = { gte: query.minExp };

  const rows = await prisma.mistri.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: publicMistriSelect,
  });

  let list = await enrich(rows);

  if (query.category) {
    list = list.filter(
      (mistri) =>
        sameLocation(mistri.category, query.category) ||
        mistri.servicesOffered.some((service) => sameLocation(service, query.category)),
    );
  }
  if (query.q) {
    const needle = query.q;
    list = list.filter((mistri) => matchesQuery(mistri, needle));
  }

  list.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    if (query.sort === "rating") return b.avgRating - a.avgRating || b.ratingsCount - a.ratingsCount;
    if (query.sort === "experience") return b.experienceYears - a.experienceYears;
    if (query.sort === "random") {
      const seed = query.seed ?? "default";
      return shuffleRank(seed, a.id) - shuffleRank(seed, b.id);
    }
    return 0; // newest: already ordered by createdAt desc; Array.prototype.sort is stable
  });

  const total = list.length;
  if (!paginated) {
    return { data: list, total, page: 1, pageSize: total, totalPages: 1, location };
  }
  return {
    data: list.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    location,
  };
}

/** One approved, visible Mistri for the public profile page, or null. */
export async function findPublicMistri(id: number): Promise<PublicMistri | null> {
  const row = await prisma.mistri.findFirst({
    where: { id, status: "APPROVED" },
    select: publicMistriSelect,
  });
  if (!row) return null;
  const hidden = await prisma.mistriAvailability.findFirst({
    where: { mistriId: id, status: "INACTIVE" },
    select: { id: true },
  });
  if (hidden) return null;
  const [enriched] = await enrich([row]);
  return enriched ?? null;
}
