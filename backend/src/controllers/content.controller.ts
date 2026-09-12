import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { publicAdsQuerySchema } from "../schemas/content.schema.js";

function sendCached(response: Response, payload: unknown): void {
  response.set("Cache-Control", "public, max-age=60");
  response.status(200).json(payload);
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** GET /api/content/locations */
export async function getLocations(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const states = await prisma.state.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        cities: {
          where: { status: "ACTIVE" },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { name: true },
        },
      },
    });

    sendCached(response, {
      success: true,
      data: states.map((state) => ({
        name: state.name,
        code: state.code,
        regionalTitle: state.regionalTitle ?? "",
        tagline: state.tagline ?? "",
        cities: state.cities.map((city) => city.name),
        activeTechniciansCount: state.activeTechniciansCount,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/categories */
export async function getCategories(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [categories, grouped] = await Promise.all([
      prisma.category.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.mistri.groupBy({
        by: ["category"],
        where: { status: "APPROVED" },
        _count: { _all: true },
      }),
    ]);

    const liveCountByName = new Map(grouped.map((row) => [row.category, row._count._all]));

    sendCached(response, {
      success: true,
      data: categories.map((category) => ({
        id: category.slug,
        name: category.name,
        hindiName: category.hindiName ?? category.name,
        iconName: category.iconName ?? "Wrench",
        description: category.description ?? "",
        avgResponseTime: category.avgResponseTime ?? "",
        techniciansAvailable: liveCountByName.get(category.name) ?? 0,
        popularServices: toStringArray(category.popularServices),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/ads?placement=HOME_BANNER | CATEGORY&state=&city=&category= */
export async function getAds(request: Request, response: Response, next: NextFunction): Promise<void> {
  const parsed = publicAdsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(422).json({ success: false, message: "Invalid ad filters." });
    return;
  }
  const { placement, state, city, category } = parsed.data;

  const where: Record<string, unknown> = { status: "ACTIVE", placement };
  if (placement === "CATEGORY") {
    where.AND = [
      { OR: [{ state: null }, ...(state ? [{ state }] : [])] },
      { OR: [{ city: null }, ...(city ? [{ city }] : [])] },
      { OR: [{ category: null }, ...(category ? [{ category }] : [])] },
    ];
  }

  try {
    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    sendCached(response, {
      success: true,
      data: ads.map((ad) => ({
        id: ad.id,
        placement: ad.placement,
        companyName: ad.companyName,
        title: ad.title,
        description: ad.description,
        ctaText: ad.ctaText,
        linkUrl: ad.linkUrl,
        imageUrl: ad.imageUrl,
        videoUrl: ad.videoUrl,
        type: ad.videoUrl && !ad.imageUrl ? "video" : "image",
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/videos */
export async function getVideos(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const videos = await prisma.advertisement.findMany({
      where: { status: "ACTIVE", placement: "VIDEO" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    sendCached(response, {
      success: true,
      data: videos.map((video) => ({
        id: video.id,
        title: video.title ?? "",
        link: video.videoUrl ?? "",
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/testimonials */
export async function getTestimonials(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    sendCached(response, {
      success: true,
      data: testimonials.map((item) => ({
        id: String(item.id),
        author: item.author,
        location: item.location,
        state: item.state,
        rating: item.rating,
        serviceCategory: item.serviceCategory,
        technicianName: item.technicianName,
        comment: item.comment,
        date: item.displayDate,
        avatarUrl: item.avatarUrl ?? "",
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/plans */
export async function getPlans(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    sendCached(response, {
      success: true,
      data: plans.map((plan) => ({
        id: plan.slug,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        badge: plan.badge,
        highlighted: plan.highlighted,
        popular: plan.popular,
        features: toStringArray(plan.features),
        idealFor: plan.idealFor,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/settings — public, safe key/value pairs the site renders (phone numbers, toggles). */
export async function getPublicSettings(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const setting of settings) map[setting.key] = setting.value;
    sendCached(response, { success: true, data: map });
  } catch (error) {
    next(error);
  }
}

/** GET /api/content/referrals/:code — validate a referral code on the register form. */
export async function validateReferral(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const code = String(request.params.code ?? "").trim();
  if (!code || code.length > 50) {
    response.status(200).json({ success: true, valid: false });
    return;
  }

  try {
    const referral = await prisma.referral.findFirst({
      where: { code, status: "ACTIVE" },
      select: { name: true },
    });
    response.status(200).json({ success: true, valid: Boolean(referral), name: referral?.name });
  } catch (error) {
    next(error);
  }
}
