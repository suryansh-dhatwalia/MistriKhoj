import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { analyticsConfig } from "../config/analytics.js";
import {
  analyticsDay,
  isBotUserAgent,
  normalizePageKey,
  visitorHash,
} from "../lib/analytics-core.js";
import { isAdAllowedIn } from "../lib/ad-visibility.js";
import { hashSessionToken, readSessionToken } from "../lib/admin-session.js";
import { slugify } from "../lib/location.js";
import { prisma } from "../lib/prisma.js";
import { idParamSchema } from "../schemas/shared.js";
import {
  bumpAdImpression,
  bumpPageView,
  profileViewTotals,
  recordProfileView,
  recordVisitorDay,
} from "../services/analytics.service.js";
import { findPublicMistri } from "../services/public-mistri.service.js";

/** Admin previews are never counted. A valid admin session cookie is the signal. */
async function isAdminRequest(request: Request): Promise<boolean> {
  const token = readSessionToken(request);
  if (!token) return false;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: { expiresAt: true },
  });
  return Boolean(session && session.expiresAt > new Date());
}

/** Why this request must not be counted at all (bots, admin previews), or null to count it. */
async function ignoreReason(request: Request): Promise<"bot" | "admin" | null> {
  if (isBotUserAgent(request.get("user-agent"))) return "bot";
  if (analyticsConfig.ignoreAdmin && (await isAdminRequest(request))) return "admin";
  return null;
}

const shouldIgnore = async (request: Request): Promise<boolean> => (await ignoreReason(request)) !== null;

function locationSlug(value: string | undefined): string {
  return value ? slugify(value).slice(0, 100) : "";
}

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(200),
  state: z.string().trim().max(100).optional(),
  city: z.string().trim().max(120).optional(),
});

/** POST /api/analytics/page-view — answers immediately, writes afterwards. */
export async function trackPageView(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = pageViewSchema.safeParse(request.body);
    const page = parsed.success ? normalizePageKey(parsed.data.path) : null;
    if (!parsed.success || !page) {
      response.status(202).json({ success: true, counted: false });
      return;
    }
    if (await shouldIgnore(request)) {
      response.status(202).json({ success: true, counted: false });
      return;
    }

    response.status(202).json({ success: true, counted: true });

    const day = analyticsDay();
    const hash = visitorHash({
      secret: analyticsConfig.secret,
      day,
      ip: request.ip ?? "",
      userAgent: request.get("user-agent") ?? "",
    });
    // Location only means something for the results page.
    const state = page === "/mistris" ? locationSlug(parsed.data.state) : "";
    const city = page === "/mistris" && state ? locationSlug(parsed.data.city) : "";
    await Promise.all([bumpPageView(day, page, state, city), recordVisitorDay(day, hash)]).catch((error) =>
      console.error("analytics page-view write failed", error),
    );
  } catch (error) {
    next(error);
  }
}

/** POST /api/analytics/profile-view/:id — returns the current total either way. */
export async function trackProfileView(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = idParamSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ success: false, message: "Invalid Mistri ID." });
      return;
    }

    // Only a profile that is actually public can collect views (no 404 / hidden pages).
    const mistri = await findPublicMistri(id.data);
    if (!mistri) {
      response.status(404).json({ success: false, message: "Mistri not found." });
      return;
    }

    let counted = false;
    const skipped = await ignoreReason(request);
    if (!skipped) {
      const now = new Date();
      // Not rotated daily: the dedupe window must hold across midnight. The row is
      // deleted shortly after the window ends.
      const viewerHash = visitorHash({
        secret: analyticsConfig.secret,
        day: new Date(0),
        ip: request.ip ?? "",
        userAgent: request.get("user-agent") ?? "",
      });
      counted = await recordProfileView({
        mistriId: id.data,
        viewerHash,
        day: analyticsDay(now),
        now,
        windowMs: analyticsConfig.profileViewWindowMs,
      });
    }

    const totals = await profileViewTotals([id.data]).catch(() => new Map<number, number>());
    response.status(200).json({
      success: true,
      counted,
      // Why a view did not count: "bot", "admin" (logged-in admin), or "duplicate" (same visitor inside the window).
      ...(counted ? {} : { reason: skipped ?? "duplicate" }),
      viewCount: totals.get(id.data) ?? 0,
    });
  } catch (error) {
    next(error);
  }
}

const impressionSchema = z.object({
  adIds: z.array(z.coerce.number().int().positive()).min(1).max(20),
  state: z.string().trim().max(100).optional(),
  city: z.string().trim().max(120).optional(),
  category: z.string().trim().max(140).optional(),
});

/**
 * POST /api/analytics/ad-impressions — counts an impression only for ads that are
 * genuinely allowed to be shown in the claimed context, so a forged request cannot
 * inflate an ad that never appeared there.
 */
export async function trackAdImpressions(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = impressionSchema.safeParse(request.body);
    if (!parsed.success || (await shouldIgnore(request))) {
      response.status(202).json({ success: true, counted: 0 });
      return;
    }

    const adIds = [...new Set(parsed.data.adIds)];
    const now = new Date();
    const [ads, campaigns] = await Promise.all([
      prisma.advertisement.findMany({ where: { id: { in: adIds } } }),
      prisma.advertisementCampaign.findMany({ where: { advertisementId: { in: adIds } } }),
    ]);
    const campaignByAd = new Map(campaigns.map((row) => [row.advertisementId, row]));
    const context = { state: parsed.data.state, city: parsed.data.city, category: parsed.data.category };

    const day = analyticsDay(now);
    const counted = ads.filter((ad) => isAdAllowedIn(ad, campaignByAd.get(ad.id) ?? null, context, now));
    response.status(202).json({ success: true, counted: counted.length });

    const isHomeContext = !context.state;
    await Promise.all(
      counted.map((ad) =>
        bumpAdImpression(
          ad.id,
          day,
          isHomeContext ? "" : locationSlug(context.state),
          isHomeContext ? "" : locationSlug(context.city),
        ),
      ),
    ).catch((error) => console.error("analytics ad-impression write failed", error));
  } catch (error) {
    next(error);
  }
}
