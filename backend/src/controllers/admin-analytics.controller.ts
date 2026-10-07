import type { NextFunction, Request, Response } from "express";
import { formatDay, resolveDayRange } from "../lib/analytics-core.js";
import { adLifecycle, deriveAdScope } from "../lib/ad-targeting.js";
import { slugify } from "../lib/location.js";
import { prisma } from "../lib/prisma.js";
import { analyticsQuerySchema } from "../schemas/ad-campaign.schema.js";
import { profileViewTotals } from "../services/analytics.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function eachDay(from: Date, to: Date): string[] {
  const days: string[] = [];
  for (let time = from.getTime(); time <= to.getTime(); time += DAY_MS) {
    days.push(formatDay(new Date(time)));
  }
  return days;
}

/**
 * GET /api/admin/analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD&state=&city=&limit=
 *
 * Four different measures, deliberately kept apart:
 *  - pageViews         every counted page load (any page)
 *  - uniqueVisitors    distinct anonymous visitors per day, summed over the range
 *                      (null while a state/city filter is on — visitors are not tied to a place)
 *  - profileViews      de-duplicated views of Mistri profile pages
 *  - adImpressions     times an ad scrolled into view
 */
export async function getAnalyticsOverview(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = analyticsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      response.status(422).json({ success: false, message: "Invalid analytics filters." });
      return;
    }
    const query = parsed.data;
    const range = resolveDayRange(query.from, query.to);
    const stateSlug = query.state ? slugify(query.state) : "";
    const citySlug = query.city ? slugify(query.city) : "";
    const locationFiltered = Boolean(stateSlug || citySlug);
    const dayFilter = { gte: range.from, lte: range.to };
    const locationFilter = {
      ...(stateSlug ? { state: stateSlug } : {}),
      ...(citySlug ? { city: citySlug } : {}),
    };

    // Mistris matching the location filter (profile views are attributed to their location).
    let filteredMistriIds: number[] | null = null;
    if (locationFiltered) {
      const candidates = await prisma.mistri.findMany({
        where: { status: "APPROVED" },
        select: { id: true, state: true, city: true },
      });
      filteredMistriIds = candidates
        .filter(
          (mistri) =>
            (!stateSlug || slugify(mistri.state) === stateSlug) &&
            (!citySlug || slugify(mistri.city) === citySlug),
        )
        .map((mistri) => mistri.id);
    }
    const mistriFilter = filteredMistriIds ? { mistriId: { in: filteredMistriIds } } : {};

    const [pageByDay, pageByPage, visitorsByDay, adByDay, adByAd, profileByDay, profileByMistri] =
      await Promise.all([
        prisma.pageViewDaily.groupBy({
          by: ["day"],
          where: { day: dayFilter, ...locationFilter },
          _sum: { views: true },
        }),
        prisma.pageViewDaily.groupBy({
          by: ["page"],
          where: { day: dayFilter, ...locationFilter },
          _sum: { views: true },
        }),
        locationFiltered
          ? Promise.resolve([])
          : prisma.visitorDaily.groupBy({ by: ["day"], where: { day: dayFilter }, _count: { _all: true } }),
        prisma.adImpressionDaily.groupBy({
          by: ["day"],
          where: { day: dayFilter, ...locationFilter },
          _sum: { impressions: true },
        }),
        prisma.adImpressionDaily.groupBy({
          by: ["advertisementId"],
          where: { day: dayFilter, ...locationFilter },
          _sum: { impressions: true },
        }),
        prisma.mistriProfileViewDaily.groupBy({
          by: ["day"],
          where: { day: dayFilter, ...mistriFilter },
          _sum: { views: true },
        }),
        prisma.mistriProfileViewDaily.groupBy({
          by: ["mistriId"],
          where: { day: dayFilter, ...mistriFilter },
          _sum: { views: true },
        }),
      ]);

    const byDay = <T extends { day: Date }>(rows: T[], pick: (row: T) => number) =>
      new Map(rows.map((row) => [formatDay(row.day), pick(row)]));
    const pageDay = byDay(pageByDay, (row) => row._sum.views ?? 0);
    const visitorDay = byDay(visitorsByDay as Array<{ day: Date; _count: { _all: number } }>, (row) => row._count._all);
    const adDay = byDay(adByDay, (row) => row._sum.impressions ?? 0);
    const profileDay = byDay(profileByDay, (row) => row._sum.views ?? 0);

    const daily = eachDay(range.from, range.to).map((day) => ({
      day,
      pageViews: pageDay.get(day) ?? 0,
      uniqueVisitors: locationFiltered ? null : (visitorDay.get(day) ?? 0),
      profileViews: profileDay.get(day) ?? 0,
      adImpressions: adDay.get(day) ?? 0,
    }));
    const sum = (pick: (row: (typeof daily)[number]) => number) => daily.reduce((total, row) => total + pick(row), 0);

    // Most-viewed profiles in the range, with lifetime totals alongside.
    const rankedMistris = profileByMistri
      .map((row) => ({ id: row.mistriId, viewsInRange: row._sum.views ?? 0 }))
      .sort((a, b) => b.viewsInRange - a.viewsInRange)
      .slice(0, query.limit);
    const [mistriRows, lifetime] = await Promise.all([
      prisma.mistri.findMany({
        where: { id: { in: rankedMistris.map((row) => row.id) } },
        select: { id: true, fullName: true, state: true, city: true, category: true },
      }),
      profileViewTotals(rankedMistris.map((row) => row.id)),
    ]);
    const mistriById = new Map(mistriRows.map((row) => [row.id, row]));
    const topProfiles = rankedMistris.flatMap((row) => {
      const mistri = mistriById.get(row.id);
      return mistri
        ? [{ ...mistri, viewsInRange: row.viewsInRange, viewsTotal: lifetime.get(row.id) ?? 0 }]
        : [];
    });

    // Every managed ad with its range and lifetime impressions.
    const now = new Date();
    const [ads, campaigns, adLifetime] = await Promise.all([
      prisma.advertisement.findMany({ where: { placement: { in: ["HOME_BANNER", "CATEGORY"] } } }),
      prisma.advertisementCampaign.findMany(),
      prisma.adImpressionDaily.groupBy({ by: ["advertisementId"], _sum: { impressions: true } }),
    ]);
    const campaignByAd = new Map(campaigns.map((row) => [row.advertisementId, row]));
    const rangeByAd = new Map(adByAd.map((row) => [row.advertisementId, row._sum.impressions ?? 0]));
    const lifetimeByAd = new Map(adLifetime.map((row) => [row.advertisementId, row._sum.impressions ?? 0]));
    const adRows = ads
      .map((ad) => {
        const campaign = campaignByAd.get(ad.id) ?? null;
        return {
          id: ad.id,
          title: ad.title,
          companyName: ad.companyName,
          scope: deriveAdScope(ad),
          state: ad.state,
          city: ad.city,
          lifecycle: adLifecycle(
            { status: ad.status, startsAt: campaign?.startsAt ?? null, endsAt: campaign?.endsAt ?? null },
            now,
          ),
          impressionsInRange: rangeByAd.get(ad.id) ?? 0,
          impressionsTotal: lifetimeByAd.get(ad.id) ?? 0,
        };
      })
      .filter((row) => !locationFiltered || row.impressionsInRange > 0)
      .sort((a, b) => b.impressionsInRange - a.impressionsInRange || b.impressionsTotal - a.impressionsTotal);

    response.status(200).json({
      success: true,
      data: {
        range: { from: formatDay(range.from), to: formatDay(range.to) },
        filters: { state: query.state ?? null, city: query.city ?? null },
        totals: {
          pageViews: sum((row) => row.pageViews),
          uniqueVisitors: locationFiltered ? null : sum((row) => row.uniqueVisitors ?? 0),
          profileViews: sum((row) => row.profileViews),
          adImpressions: sum((row) => row.adImpressions),
        },
        daily,
        byPage: pageByPage
          .map((row) => ({ page: row.page, views: row._sum.views ?? 0 }))
          .sort((a, b) => b.views - a.views),
        topProfiles,
        ads: adRows,
      },
    });
  } catch (error) {
    next(error);
  }
}
