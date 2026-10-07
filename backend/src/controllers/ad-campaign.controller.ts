import type { NextFunction, Request, Response } from "express";
import type { Advertisement, AdvertisementCampaign } from "../../generated/prisma/client.js";
import { ensureAdRateCardSettings, getAdRateCard } from "../config/ad-pricing.js";
import {
  adLifecycle,
  deriveAdScope,
  validateAdRateCard,
  type AdLifecycle,
  type AdScopeName,
} from "../lib/ad-targeting.js";
import { sameLocation } from "../lib/location.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import {
  adCampaignSchema,
  adRateCardSchema,
  adStatusSchema,
  adminAdListQuerySchema,
  type AdCampaignInput,
} from "../schemas/ad-campaign.schema.js";
import { idParamSchema } from "../schemas/shared.js";
import { HttpError } from "../utils/http-error.js";
import { adMediaToData, removeAdCreative } from "./content-admin.controller.js";

/** Only homepage banners and location-targeted ads are managed here (not VIDEO placement). */
const MANAGED_PLACEMENTS = ["HOME_BANNER", "CATEGORY"] as const;

function present(
  ad: Advertisement,
  campaign: AdvertisementCampaign | null,
  impressions: number,
  now: Date,
) {
  const scope = deriveAdScope(ad);
  return {
    id: ad.id,
    title: ad.title,
    companyName: ad.companyName,
    description: ad.description,
    ctaText: ad.ctaText,
    linkUrl: ad.linkUrl,
    imageUrl: ad.imageUrl,
    videoUrl: ad.videoUrl,
    mediaType: ad.videoUrl && !ad.imageUrl ? ("video" as const) : ("image" as const),
    placement: ad.placement,
    scope,
    /** A CATEGORY ad with no state predates targeting; it is hidden until an admin targets it. */
    needsTargeting: scope === null,
    state: ad.state,
    city: ad.city,
    priceInr: campaign?.priceInr ?? null,
    startsAt: campaign?.startsAt?.toISOString() ?? null,
    endsAt: campaign?.endsAt?.toISOString() ?? null,
    status: ad.status,
    lifecycle: adLifecycle(
      { status: ad.status, startsAt: campaign?.startsAt ?? null, endsAt: campaign?.endsAt ?? null },
      now,
    ),
    impressions,
    sortOrder: ad.sortOrder,
    createdAt: ad.createdAt.toISOString(),
    updatedAt: ad.updatedAt.toISOString(),
  };
}

async function impressionTotals(adIds: number[]): Promise<Map<number, number>> {
  const totals = new Map<number, number>();
  if (adIds.length === 0) return totals;
  const rows = await prisma.adImpressionDaily.groupBy({
    by: ["advertisementId"],
    where: { advertisementId: { in: adIds } },
    _sum: { impressions: true },
  });
  for (const row of rows) totals.set(row.advertisementId, row._sum.impressions ?? 0);
  return totals;
}

async function loadOne(id: number) {
  const ad = await prisma.advertisement.findFirst({
    where: { id, placement: { in: [...MANAGED_PLACEMENTS] } },
  });
  if (!ad) return null;
  const [campaign, totals] = await Promise.all([
    prisma.advertisementCampaign.findUnique({ where: { advertisementId: id } }),
    impressionTotals([id]),
  ]);
  return present(ad, campaign, totals.get(id) ?? 0, new Date());
}

/**
 * Checks the chosen state / city against the State and City masters and returns their
 * canonical spelling, so "assam" and "Assam" can never become two different targets.
 */
export async function resolveLocation(
  input: Pick<AdCampaignInput, "scope" | "state" | "city">,
): Promise<{ state: string | null; city: string | null }> {
  if (input.scope === "HOME") return { state: null, city: null };

  const states = await prisma.state.findMany({ include: { cities: true } });
  const state = states.find((row) => sameLocation(row.name, input.state));
  if (!state) {
    throw new HttpError(422, "Choose a state from the list.", { state: ["Unknown state."] });
  }
  if (input.scope === "STATE") return { state: state.name, city: null };

  const city = state.cities.find((row) => sameLocation(row.name, input.city));
  if (!city) {
    throw new HttpError(422, "That city does not belong to the selected state.", {
      city: [`${input.city} is not a city in ${state.name}.`],
    });
  }
  return { state: state.name, city: city.name };
}

/** Price defaults to the rate card; targeted ads must stay cheaper than homepage ads. */
async function resolvePrice(scope: AdScopeName, requested: number | undefined): Promise<number> {
  const rates = await getAdRateCard(prisma);
  const price = requested ?? rates[scope];
  if (scope !== "HOME" && price >= rates.HOME) {
    throw new HttpError(422, "Targeted ads must cost less than homepage ads.", {
      priceInr: [`Keep this below the homepage price of ₹${rates.HOME}.`],
    });
  }
  return price;
}

function parseId(request: Request, response: Response): number | null {
  const id = idParamSchema.safeParse(request.params.id);
  if (!id.success) {
    response.status(400).json({ success: false, message: "Invalid advertisement ID." });
    return null;
  }
  return id.data;
}

/** GET /api/admin/ads */
export async function listAds(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = adminAdListQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      response.status(422).json({ success: false, message: "Invalid filters.", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const query = parsed.data;
    const now = new Date();

    const ads = await prisma.advertisement.findMany({
      where: {
        placement: { in: [...MANAGED_PLACEMENTS] },
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search } },
                { companyName: { contains: query.search } },
                { state: { contains: query.search } },
                { city: { contains: query.search } },
              ],
            }
          : {}),
      },
    });
    const ids = ads.map((ad) => ad.id);
    const [campaigns, totals] = await Promise.all([
      prisma.advertisementCampaign.findMany({ where: { advertisementId: { in: ids } } }),
      impressionTotals(ids),
    ]);
    const campaignByAd = new Map(campaigns.map((row) => [row.advertisementId, row]));

    let rows = ads.map((ad) => present(ad, campaignByAd.get(ad.id) ?? null, totals.get(ad.id) ?? 0, now));
    if (query.scope) rows = rows.filter((row) => row.scope === query.scope);
    if (query.lifecycle) rows = rows.filter((row) => row.lifecycle === query.lifecycle);
    if (query.state) rows = rows.filter((row) => sameLocation(row.state, query.state));
    if (query.city) rows = rows.filter((row) => sameLocation(row.city, query.city));

    const direction = query.sortOrder === "asc" ? 1 : -1;
    const sortValue = (row: (typeof rows)[number]): string | number => {
      switch (query.sortBy) {
        case "impressions":
          return row.impressions;
        case "priceInr":
          return row.priceInr ?? -1;
        case "title":
          return (row.title ?? "").toLowerCase();
        case "startsAt":
          return row.startsAt ?? "";
        case "endsAt":
          return row.endsAt ?? "";
        default:
          return row.createdAt;
      }
    };
    rows.sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      return (left < right ? -1 : left > right ? 1 : 0) * direction || b.id - a.id;
    });

    const total = rows.length;
    response.status(200).json({
      success: true,
      data: rows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/admin/ads/:id */
export async function getAd(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request, response);
    if (id === null) return;
    const ad = await loadOne(id);
    if (!ad) {
      response.status(404).json({ success: false, message: "Advertisement not found." });
      return;
    }
    response.status(200).json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
}

function validationFailure(response: Response, error: { flatten: () => { fieldErrors: unknown } }): void {
  response.status(422).json({
    success: false,
    message: "Please correct the highlighted fields.",
    errors: error.flatten().fieldErrors,
  });
}

/** POST /api/admin/ads */
export async function createAd(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = adCampaignSchema.safeParse(request.body);
    if (!parsed.success) return validationFailure(response, parsed.error);
    const input = parsed.data;

    if (!input.image && !input.video) {
      response.status(422).json({
        success: false,
        message: "Please correct the highlighted fields.",
        errors: { image: ["Upload an image or a video."] },
      });
      return;
    }

    const location = await resolveLocation(input);
    const priceInr = await resolvePrice(input.scope, input.priceInr);
    const media = await adMediaToData({ image: input.image, video: input.video });
    const admin = response.locals.admin as SafeAdmin;

    const created = await prisma.$transaction(async (tx) => {
      const ad = await tx.advertisement.create({
        data: {
          placement: input.scope === "HOME" ? "HOME_BANNER" : "CATEGORY",
          title: input.title,
          companyName: input.companyName ?? null,
          description: input.description ?? null,
          ctaText: input.ctaText ?? null,
          linkUrl: input.linkUrl ?? null,
          state: location.state,
          city: location.city,
          sortOrder: input.sortOrder,
          status: input.status,
          ...(media as object),
        },
      });
      await tx.advertisementCampaign.create({
        data: {
          advertisementId: ad.id,
          scope: input.scope,
          priceInr,
          startsAt: input.startsAt ?? null,
          endsAt: input.endsAt ?? null,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "ADVERTISEMENT_CREATED",
          entityType: "Advertisement",
          entityId: String(ad.id),
          details: { scope: input.scope, state: location.state, city: location.city, priceInr },
        },
      });
      return ad;
    });

    response.status(201).json({ success: true, data: await loadOne(created.id) });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/admin/ads/:id — full replace of the editable fields (media optional). */
export async function updateAd(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request, response);
    if (id === null) return;
    const parsed = adCampaignSchema.safeParse(request.body);
    if (!parsed.success) return validationFailure(response, parsed.error);
    const input = parsed.data;

    const existing = await prisma.advertisement.findFirst({
      where: { id, placement: { in: [...MANAGED_PLACEMENTS] } },
    });
    if (!existing) {
      response.status(404).json({ success: false, message: "Advertisement not found." });
      return;
    }

    const location = await resolveLocation(input);
    const priceInr = await resolvePrice(input.scope, input.priceInr);
    const media = await adMediaToData(
      { image: input.image, video: input.video },
      { imageUrl: existing.imageUrl, videoUrl: existing.videoUrl },
    );
    const admin = response.locals.admin as SafeAdmin;

    await prisma.$transaction(async (tx) => {
      await tx.advertisement.update({
        where: { id },
        data: {
          placement: input.scope === "HOME" ? "HOME_BANNER" : "CATEGORY",
          title: input.title,
          companyName: input.companyName ?? null,
          description: input.description ?? null,
          ctaText: input.ctaText ?? null,
          linkUrl: input.linkUrl ?? null,
          state: location.state,
          city: location.city,
          sortOrder: input.sortOrder,
          status: input.status,
          ...(media as object),
        },
      });
      await tx.advertisementCampaign.upsert({
        where: { advertisementId: id },
        create: {
          advertisementId: id,
          scope: input.scope,
          priceInr,
          startsAt: input.startsAt ?? null,
          endsAt: input.endsAt ?? null,
        },
        update: { scope: input.scope, priceInr, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "ADVERTISEMENT_UPDATED",
          entityType: "Advertisement",
          entityId: String(id),
          details: { scope: input.scope, state: location.state, city: location.city, priceInr },
        },
      });
    });

    // A replaced creative is removed from Cloudinary only after the update succeeded.
    const replaced = (media as { imagePublicId?: string | null }).imagePublicId;
    if (existing.imagePublicId && replaced !== undefined && replaced !== existing.imagePublicId) {
      await removeAdCreative({
        imagePublicId: existing.imagePublicId,
        videoUrl: existing.videoUrl,
      });
    }

    response.status(200).json({ success: true, data: await loadOne(id) });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/admin/ads/:id/status — activate or pause without touching anything else. */
export async function setAdStatus(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request, response);
    if (id === null) return;
    const parsed = adStatusSchema.safeParse(request.body);
    if (!parsed.success) return validationFailure(response, parsed.error);

    const existing = await prisma.advertisement.findFirst({
      where: { id, placement: { in: [...MANAGED_PLACEMENTS] } },
      select: { id: true },
    });
    if (!existing) {
      response.status(404).json({ success: false, message: "Advertisement not found." });
      return;
    }
    const admin = response.locals.admin as SafeAdmin;
    await prisma.$transaction([
      prisma.advertisement.update({ where: { id }, data: { status: parsed.data.status } }),
      prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: parsed.data.status === "ACTIVE" ? "ADVERTISEMENT_ACTIVATED" : "ADVERTISEMENT_PAUSED",
          entityType: "Advertisement",
          entityId: String(id),
        },
      }),
    ]);
    response.status(200).json({ success: true, data: await loadOne(id) });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/admin/ads/:id */
export async function deleteAd(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request, response);
    if (id === null) return;
    const existing = await prisma.advertisement.findFirst({
      where: { id, placement: { in: [...MANAGED_PLACEMENTS] } },
    });
    if (!existing) {
      response.status(404).json({ success: false, message: "Advertisement not found." });
      return;
    }
    const admin = response.locals.admin as SafeAdmin;
    await prisma.$transaction([
      prisma.advertisementCampaign.deleteMany({ where: { advertisementId: id } }),
      prisma.adImpressionDaily.deleteMany({ where: { advertisementId: id } }),
      prisma.advertisement.delete({ where: { id } }),
      prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "ADVERTISEMENT_DELETED",
          entityType: "Advertisement",
          entityId: String(id),
        },
      }),
    ]);
    await removeAdCreative({ imagePublicId: existing.imagePublicId, videoUrl: existing.videoUrl });
    response.status(200).json({ success: true, message: "Advertisement deleted." });
  } catch (error) {
    next(error);
  }
}

/** GET /api/admin/ads/rate-card */
export async function getRateCard(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    await ensureAdRateCardSettings(prisma);
    response.status(200).json({ success: true, data: await getAdRateCard(prisma) });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/admin/ads/rate-card */
export async function updateRateCard(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = adRateCardSchema.safeParse(request.body);
    if (!parsed.success) return validationFailure(response, parsed.error);
    const problem = validateAdRateCard(parsed.data);
    if (problem) {
      response.status(422).json({ success: false, message: problem });
      return;
    }
    await ensureAdRateCardSettings(prisma);
    const admin = response.locals.admin as SafeAdmin;
    await prisma.$transaction([
      prisma.siteSetting.update({ where: { key: "ad_price_home_inr" }, data: { value: parsed.data.HOME } }),
      prisma.siteSetting.update({ where: { key: "ad_price_state_inr" }, data: { value: parsed.data.STATE } }),
      prisma.siteSetting.update({ where: { key: "ad_price_city_inr" }, data: { value: parsed.data.CITY } }),
      prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "AD_RATE_CARD_UPDATED",
          entityType: "SiteSetting",
          entityId: "ad_price_*",
          details: parsed.data,
        },
      }),
    ]);
    response.status(200).json({ success: true, data: await getAdRateCard(prisma) });
  } catch (error) {
    next(error);
  }
}

export type { AdLifecycle };
