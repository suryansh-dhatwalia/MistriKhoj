import type { NextFunction, Request, Response } from "express";
import { getPaidPlanPriceInr } from "../config/subscription.js";
import { prisma } from "../lib/prisma.js";
import { mistriRatingSchema, mistriRegistrationSchema, paidSlotQuerySchema } from "../schemas/mistri.schema.js";
import { idParamSchema } from "../schemas/shared.js";
import { publicMistriQuerySchema } from "../schemas/directory.schema.js";
import { profileViewTotals } from "../services/analytics.service.js";
import {
  findPublicMistri,
  loadPublicLocations,
  queryPublicMistris,
} from "../services/public-mistri.service.js";
import {
  removeStoredImages,
  storeImage,
  type StoredImage,
} from "../services/image.service.js";

/**
 * GET /api/mistris — approved, visible Mistris. Accepts state / city / category / q /
 * minExp / sort filters; paginated when `page` or `pageSize` is sent, otherwise returns
 * the full list exactly as before.
 */
export async function listMistris(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = publicMistriQuerySchema.parse(request.query);
    const result = await queryPublicMistris(query);
    response.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/** GET /api/mistris/locations — states and cities that currently have a live Mistri. */
export async function getMistriLocations(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await loadPublicLocations();
    response.set("Cache-Control", "public, max-age=60");
    response.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** GET /api/mistris/:id — one public profile, including its lifetime view count. */
export async function getMistriProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = idParamSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ success: false, message: "Invalid Mistri ID." });
      return;
    }
    const mistri = await findPublicMistri(id.data);
    if (!mistri) {
      response.status(404).json({ success: false, message: "This Mistri profile is not available." });
      return;
    }
    // The counter is secondary: if its table is unavailable the profile must still load.
    const totals = await profileViewTotals([id.data]).catch((error: unknown) => {
      console.error("profile view count unavailable", error);
      return new Map<number, number>();
    });
    response.status(200).json({ success: true, data: { ...mistri, viewCount: totals.get(id.data) ?? 0 } });
  } catch (error) {
    next(error);
  }
}

export async function getPaidSlotStatus(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = paidSlotQuerySchema.safeParse(request.query);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Provide a state, city, and category to check the paid slot.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const { state, city, category } = validation.data;

  try {
    const now = new Date();
    const activePaid = await prisma.mistriSubscription.findFirst({
      where: {
        plan: "PAID",
        state,
        city,
        category,
        expiresAt: { gt: now },
      },
      select: { mistriId: true, expiresAt: true },
      orderBy: { expiresAt: "desc" },
    });

    // The slot is genuinely taken only if that holder is still an approved,
    // published Mistri (a rejected one has its subscription row deleted, but
    // guard anyway).
    let heldUntil: string | null = null;
    if (activePaid?.expiresAt) {
      const holder = await prisma.mistri.findFirst({
        where: { id: activePaid.mistriId, status: "APPROVED" },
        select: { id: true },
      });
      if (holder) {
        heldUntil = activePaid.expiresAt.toISOString();
      }
    }

    response.status(200).json({
      success: true,
      available: heldUntil == null,
      heldUntil,
      priceInr: await getPaidPlanPriceInr(prisma),
    });
  } catch (error) {
    next(error);
  }
}

export async function registerMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = mistriRegistrationSchema.safeParse(request.body);

  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the highlighted registration fields.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const input = validation.data;
  const uploadedPublicIds: string[] = [];

  try {
    const existingMistri = await prisma.mistri.findFirst({
      where: { primaryPhone: input.primaryPhone },
      select: { id: true },
    });

    if (existingMistri) {
      response.status(409).json({
        success: false,
        message: "A Mistri is already registered with this primary phone number.",
      });
      return;
    }

    // A Mistri may register from any state / city in India, so location is free-form
    // and not checked against the CMS state / city masters. Only the category is
    // validated, and only once the CMS category master is populated.
    const activeCategoryCount = await prisma.category.count({ where: { status: "ACTIVE" } });

    const selectionErrors: Record<string, string[]> = {};

    if (activeCategoryCount > 0) {
      const category = await prisma.category.findFirst({
        where: { name: input.category, status: "ACTIVE" },
        select: { id: true },
      });
      if (!category) {
        selectionErrors.category = [
          "This service category is no longer available. Please pick another.",
        ];
      }
    }

    if (Object.keys(selectionErrors).length > 0) {
      response.status(422).json({
        success: false,
        message:
          "Some of your selections are no longer available. Please review the highlighted fields and try again.",
        errors: selectionErrors,
      });
      return;
    }

    // Required as of the mistriRegistrationSchema check above — every new
    // registration uploads a real photo. Existing Mistris registered before this
    // was enforced may still have a blank profilePhotoUrl; that's untouched here.
    const profilePhoto: StoredImage = await storeImage(
      input.profilePhoto,
      "mistrikhoj/mistris/profile-photos",
    );
    if (profilePhoto.publicId) {
      uploadedPublicIds.push(profilePhoto.publicId);
    }

    const galleryImages: StoredImage[] = [];
    for (const image of input.galleryImages) {
      const storedImage = await storeImage(image, "mistrikhoj/mistris/gallery");
      galleryImages.push(storedImage);
      if (storedImage.publicId) {
        uploadedPublicIds.push(storedImage.publicId);
      }
    }

    // Only keep a referral code that maps to an active entry in the Referral master.
    let referralCode: string | undefined = input.referralCode;
    if (referralCode) {
      const referral = await prisma.referral.findFirst({
        where: { code: referralCode, status: "ACTIVE" },
        select: { id: true },
      });
      if (!referral) {
        referralCode = undefined;
      }
    }

    // Create the registration and its subscription row together. A PAID choice
    // only records intent + the fixed price here; the top slot and the one-year
    // window are granted when an admin approves the Mistri.
    const mistri = await prisma.$transaction(async (tx) => {
      const created = await tx.mistri.create({
        data: {
          state: input.state,
          city: input.city,
          category: input.category,
          fullName: input.fullName,
          primaryPhone: input.primaryPhone,
          alternatePhone: input.alternatePhone,
          qualification: input.qualification,
          address: input.address,
          pincode: input.pincode,
          experienceYears: input.experienceYears,
          servicesOffered: input.servicesOffered,
          shortIntro: input.shortIntro,
          profilePhotoUrl: profilePhoto.url,
          profilePhotoPublicId: profilePhoto.publicId,
          galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
          referralCode,
          termsAcceptedAt: new Date(),
        },
        select: {
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
          referralCode: true,
          createdAt: true,
        },
      });

      await tx.mistriSubscription.create({
        data: {
          mistriId: created.id,
          plan: input.subscriptionPlan,
          state: input.state,
          city: input.city,
          category: input.category,
          priceInr: input.subscriptionPlan === "PAID" ? await getPaidPlanPriceInr(tx) : 0,
        },
      });

      return created;
    });

    response.status(201).json({
      success: true,
      message: "Mistri registration completed successfully.",
      data: { ...mistri, plan: input.subscriptionPlan },
    });
  } catch (error) {
    await removeStoredImages(uploadedPublicIds);
    next(error);
  }
}

/**
 * POST /api/mistris/:id/rating — public, anonymous star rating (1-5, no comment).
 * Counts immediately; an admin can later deactivate a fake/abusive one from the
 * Ratings screen, which excludes it from the average shown on the public site.
 */
export async function rateMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = idParamSchema.safeParse(request.params.id);
  if (!id.success) {
    response.status(400).json({ success: false, message: "Invalid Mistri ID." });
    return;
  }

  const validation = mistriRatingSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please pick a star rating from 1 to 5.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const mistri = await prisma.mistri.findFirst({
      where: { id: id.data, status: "APPROVED" },
      select: { id: true },
    });
    if (!mistri) {
      response.status(404).json({ success: false, message: "This Mistri could not be found." });
      return;
    }

    await prisma.mistriRating.create({
      data: { mistriId: id.data, rating: validation.data.rating },
    });

    const aggregate = await prisma.mistriRating.aggregate({
      where: { mistriId: id.data, status: "ACTIVE" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    response.status(201).json({
      success: true,
      message: "Thanks for rating this Mistri!",
      data: {
        avgRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
        ratingsCount: aggregate._count.rating,
      },
    });
  } catch (error) {
    next(error);
  }
}
