import type { NextFunction, Request, Response } from "express";
import { PAID_PLAN_PRICE_INR } from "../config/subscription.js";
import { prisma } from "../lib/prisma.js";
import { mistriRegistrationSchema, paidSlotQuerySchema } from "../schemas/mistri.schema.js";
import {
  removeStoredImages,
  storeImage,
  type StoredImage,
} from "../services/image.service.js";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "url" in item && typeof item.url === "string") {
      return [item.url];
    }
    return [];
  });
}

export async function listMistris(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const mistris = await prisma.mistri.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
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
        createdAt: true,
      },
    });

    // Attach the paid "top listing" flag. Only PAID subscriptions matter here, and
    // a slot is live only while `expiresAt` is in the future (set on admin approval).
    const now = Date.now();
    const paidSubscriptions =
      mistris.length > 0
        ? await prisma.mistriSubscription.findMany({
            where: { mistriId: { in: mistris.map((mistri) => mistri.id) }, plan: "PAID" },
            select: { mistriId: true, expiresAt: true },
          })
        : [];

    const featuredUntilByMistriId = new Map<number, Date>();
    for (const subscription of paidSubscriptions) {
      if (subscription.expiresAt && subscription.expiresAt.getTime() > now) {
        featuredUntilByMistriId.set(subscription.mistriId, subscription.expiresAt);
      }
    }

    const data = mistris
      .map((mistri) => {
        const featuredUntil = featuredUntilByMistriId.get(mistri.id) ?? null;
        return {
          ...mistri,
          servicesOffered: toStringArray(mistri.servicesOffered),
          galleryImages: toGalleryUrls(mistri.galleryImages),
          plan: featuredUntil ? ("PAID" as const) : ("FREE" as const),
          isFeatured: featuredUntil != null,
          featuredUntil: featuredUntil ? featuredUntil.toISOString() : null,
        };
      })
      // Featured profiles first; `createdAt desc` order is preserved within each
      // group (Array.prototype.sort is stable). The public directory does the
      // final per-filter pinning client-side.
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

    response.status(200).json({ success: true, data });
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
      priceInr: PAID_PLAN_PRICE_INR,
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

    // Reject a stale registration form whose state / city / category was removed or set
    // to Inactive by an admin after the form was loaded. Checked before any image upload
    // so nothing is wasted, and only enforced once the CMS masters are populated.
    const [activeStateCount, activeCategoryCount] = await Promise.all([
      prisma.state.count({ where: { status: "ACTIVE" } }),
      prisma.category.count({ where: { status: "ACTIVE" } }),
    ]);

    const selectionErrors: Record<string, string[]> = {};

    if (activeStateCount > 0) {
      const state = await prisma.state.findFirst({
        where: { name: input.state, status: "ACTIVE" },
        select: { id: true },
      });
      if (!state) {
        selectionErrors.state = ["This state is no longer available. Please pick another."];
      } else {
        const city = await prisma.city.findFirst({
          where: { name: input.city, status: "ACTIVE", state: { name: input.state } },
          select: { id: true },
        });
        if (!city) {
          selectionErrors.city = ["This city is no longer available. Please pick another."];
        }
      }
    }

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

    // The profile photo is optional. When it is omitted, an empty URL is stored
    // and the public site / admin dashboard render a default silhouette avatar.
    let profilePhoto: StoredImage = { url: "", publicId: null };
    if (input.profilePhoto) {
      profilePhoto = await storeImage(input.profilePhoto, "mistrikhoj/mistris/profile-photos");
      if (profilePhoto.publicId) {
        uploadedPublicIds.push(profilePhoto.publicId);
      }
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
          priceInr: input.subscriptionPlan === "PAID" ? PAID_PLAN_PRICE_INR : 0,
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
