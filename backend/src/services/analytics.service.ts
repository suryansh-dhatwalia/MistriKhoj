import { prisma } from "../lib/prisma.js";
import { formatDay } from "../lib/analytics-core.js";

/**
 * Counter writes. All of them are single atomic `INSERT ... ON DUPLICATE KEY UPDATE`
 * statements, so concurrent requests never lose an increment. DATE columns receive
 * `YYYY-MM-DD` strings so the driver's timezone handling can never shift a day.
 */

export async function bumpPageView(day: Date, page: string, state: string, city: string): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO page_views_daily (day, page, state, city, views)
    VALUES (${formatDay(day)}, ${page}, ${state}, ${city}, 1)
    ON DUPLICATE KEY UPDATE views = views + 1`;
}

export async function recordVisitorDay(day: Date, hash: string): Promise<void> {
  await prisma.$executeRaw`
    INSERT IGNORE INTO visitors_daily (day, visitor_hash) VALUES (${formatDay(day)}, ${hash})`;
}

export async function bumpAdImpression(
  advertisementId: number,
  day: Date,
  state: string,
  city: string,
): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO ad_impressions_daily (advertisement_id, day, state, city, impressions)
    VALUES (${advertisementId}, ${formatDay(day)}, ${state}, ${city}, 1)
    ON DUPLICATE KEY UPDATE impressions = impressions + 1`;
}

/**
 * Counts one profile view unless this visitor already counted inside the dedupe window.
 * The insert-or-conditional-update pair is race-safe: only one of two simultaneous
 * requests from the same visitor can win the row.
 */
export async function recordProfileView(params: {
  mistriId: number;
  viewerHash: string;
  day: Date;
  now: Date;
  windowMs: number;
}): Promise<boolean> {
  const { mistriId, viewerHash, day, now, windowMs } = params;
  const cutoff = new Date(now.getTime() - windowMs);

  let counted =
    (await prisma.$executeRaw`
      INSERT IGNORE INTO mistri_profile_viewers (mistri_id, visitor_hash, last_counted_at)
      VALUES (${mistriId}, ${viewerHash}, ${now})`) === 1;

  if (!counted) {
    counted =
      (await prisma.$executeRaw`
        UPDATE mistri_profile_viewers SET last_counted_at = ${now}
        WHERE mistri_id = ${mistriId} AND visitor_hash = ${viewerHash} AND last_counted_at <= ${cutoff}`) === 1;
  }

  if (counted) {
    await prisma.$executeRaw`
      INSERT INTO mistri_profile_views_daily (mistri_id, day, views)
      VALUES (${mistriId}, ${formatDay(day)}, 1)
      ON DUPLICATE KEY UPDATE views = views + 1`;
  }

  // Dedupe rows only need to outlive the window; trim them now and then.
  if (Math.random() < 0.02) {
    await prisma.mistriProfileViewer
      .deleteMany({ where: { lastCountedAt: { lt: new Date(now.getTime() - windowMs * 2) } } })
      .catch(() => undefined);
  }

  return counted;
}

/** Lifetime profile views for the given Mistris (missing ids are 0). */
export async function profileViewTotals(mistriIds: number[]): Promise<Map<number, number>> {
  const totals = new Map<number, number>();
  if (mistriIds.length === 0) return totals;
  const rows = await prisma.mistriProfileViewDaily.groupBy({
    by: ["mistriId"],
    where: { mistriId: { in: mistriIds } },
    _sum: { views: true },
  });
  for (const row of rows) totals.set(row.mistriId, row._sum.views ?? 0);
  return totals;
}
