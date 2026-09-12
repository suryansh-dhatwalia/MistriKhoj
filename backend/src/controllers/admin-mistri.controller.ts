import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { PAID_PLAN_PRICE_INR, paidPlanExpiryFrom } from "../config/subscription.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import {
  adminMistriQuerySchema,
  adminMistriUpdateSchema,
  rejectMistriSchema,
} from "../schemas/admin.schema.js";
import { removeStoredImages } from "../services/image.service.js";

function parseMistriId(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function galleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "url" in item && typeof item.url === "string") {
      return [item.url];
    }
    return [];
  });
}

function galleryPublicIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && "publicId" in item && typeof item.publicId === "string") {
      return [item.publicId];
    }
    return [];
  });
}

function presentMistri<T extends { servicesOffered: unknown; galleryImages: unknown }>(mistri: T) {
  return {
    ...mistri,
    servicesOffered: toStringArray(mistri.servicesOffered),
    galleryImages: galleryUrls(mistri.galleryImages),
  };
}

const adminMistriSelect = {
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
  status: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
} satisfies Prisma.MistriSelect;

// ---------------------------------------------------------------------------
// Subscription (Free / Paid plan) helpers. `MistriSubscription` has no Prisma
// relation back to `Mistri`, so it is always joined in code via `mistriId`.
// ---------------------------------------------------------------------------

const slotDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

interface SubscriptionInfo {
  plan: "FREE" | "PAID";
  priceInr: number;
  subscriptionStartsAt: string | null;
  featuredUntil: string | null;
  slotActive: boolean;
}

const FREE_SUBSCRIPTION_INFO: SubscriptionInfo = {
  plan: "FREE",
  priceInr: 0,
  subscriptionStartsAt: null,
  featuredUntil: null,
  slotActive: false,
};

async function subscriptionInfoByMistriId(ids: number[]): Promise<Map<number, SubscriptionInfo>> {
  const map = new Map<number, SubscriptionInfo>();
  if (ids.length === 0) return map;

  const rows = await prisma.mistriSubscription.findMany({
    where: { mistriId: { in: ids } },
    select: { mistriId: true, plan: true, priceInr: true, startsAt: true, expiresAt: true },
  });

  const now = Date.now();
  for (const row of rows) {
    const slotActive =
      row.plan === "PAID" && row.expiresAt != null && row.expiresAt.getTime() > now;
    map.set(row.mistriId, {
      plan: row.plan,
      priceInr: row.priceInr,
      subscriptionStartsAt: row.startsAt ? row.startsAt.toISOString() : null,
      featuredUntil: slotActive && row.expiresAt ? row.expiresAt.toISOString() : null,
      slotActive,
    });
  }

  return map;
}

function withSubscription<T extends { id: number }>(
  mistri: T,
  info: Map<number, SubscriptionInfo>,
): T & SubscriptionInfo {
  return { ...mistri, ...(info.get(mistri.id) ?? FREE_SUBSCRIPTION_INFO) };
}

/** Thrown inside an approve / update transaction when the paid slot is already held. */
class PaidSlotTakenError extends Error {
  constructor(
    readonly heldUntil: Date,
    readonly state: string,
    readonly city: string,
    readonly category: string,
  ) {
    super("PAID_SLOT_TAKEN");
    this.name = "PaidSlotTakenError";
  }
}

function paidSlotTakenMessage(error: PaidSlotTakenError): string {
  return (
    `The paid top slot for ${error.category} in ${error.city}, ${error.state} is held until ` +
    `${slotDateFormatter.format(error.heldUntil)}. Switch this applicant to the Free plan ` +
    `(Edit their registration) before approving, or approve after that date.`
  );
}

/**
 * Inside a transaction, checks whether another active PAID holder already occupies
 * the (state, city, category) slot. Throws {@link PaidSlotTakenError} if so.
 */
async function assertPaidSlotFree(
  tx: Prisma.TransactionClient,
  params: { mistriId: number; state: string; city: string; category: string; now: Date },
): Promise<void> {
  const conflict = await tx.mistriSubscription.findFirst({
    where: {
      plan: "PAID",
      state: params.state,
      city: params.city,
      category: params.category,
      mistriId: { not: params.mistriId },
      expiresAt: { gt: params.now },
    },
    select: { mistriId: true, expiresAt: true },
    orderBy: { expiresAt: "desc" },
  });

  if (!conflict?.expiresAt) return;

  const holder = await tx.mistri.findFirst({
    where: { id: conflict.mistriId, status: "APPROVED" },
    select: { id: true },
  });
  if (holder) {
    throw new PaidSlotTakenError(conflict.expiresAt, params.state, params.city, params.category);
  }
}

/** Ensures a subscription row exists for a Mistri (older records / safety net). */
async function ensureSubscription(
  tx: Prisma.TransactionClient,
  mistri: { id: number; state: string; city: string; category: string },
) {
  const existing = await tx.mistriSubscription.findUnique({ where: { mistriId: mistri.id } });
  if (existing) return existing;
  return tx.mistriSubscription.create({
    data: {
      mistriId: mistri.id,
      plan: "FREE",
      state: mistri.state,
      city: mistri.city,
      category: mistri.category,
      priceInr: 0,
    },
  });
}

export async function listAdminMistris(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = adminMistriQuerySchema.safeParse(request.query);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Invalid Mistri list filters.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const input = validation.data;

  try {
    // Plan lives on `MistriSubscription`; narrow by id when a plan filter is set.
    let planMistriIds: number[] | undefined;
    if (input.plan) {
      const planRows = await prisma.mistriSubscription.findMany({
        where: { plan: input.plan },
        select: { mistriId: true },
      });
      planMistriIds = planRows.map((row) => row.mistriId);
    }

    const where: Prisma.MistriWhereInput = {
      status: input.status,
      ...(planMistriIds ? { id: { in: planMistriIds } } : {}),
      ...(input.state ? { state: input.state } : {}),
      ...(input.city ? { city: { contains: input.city } } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.search
        ? {
            OR: [
              { fullName: { contains: input.search } },
              { primaryPhone: { contains: input.search } },
              { alternatePhone: { contains: input.search } },
              { city: { contains: input.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.mistri.findMany({
        where,
        select: adminMistriSelect,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      prisma.mistri.count({ where }),
    ]);

    const info = await subscriptionInfoByMistriId(items.map((item) => item.id));

    response.status(200).json({
      success: true,
      data: items.map((item) => withSubscription(presentMistri(item), info)),
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = parseMistriId(request.params.id);
  if (!id) {
    response.status(400).json({ success: false, message: "Invalid Mistri ID." });
    return;
  }

  try {
    const mistri = await prisma.mistri.findUnique({ where: { id }, select: adminMistriSelect });
    if (!mistri) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }
    const info = await subscriptionInfoByMistriId([id]);
    response.status(200).json({ success: true, data: withSubscription(presentMistri(mistri), info) });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = parseMistriId(request.params.id);
  if (!id) {
    response.status(400).json({ success: false, message: "Invalid Mistri ID." });
    return;
  }

  const validation = adminMistriUpdateSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the highlighted Mistri fields.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const { plan, ...mistriData } = validation.data;

  try {
    const admin = response.locals.admin as SafeAdmin;
    const existing = await prisma.mistri.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }

    const now = new Date();
    const mistri = await prisma.$transaction(async (tx) => {
      const updated = await tx.mistri.update({
        where: { id },
        data: mistriData,
        select: adminMistriSelect,
      });

      const sub = await ensureSubscription(tx, updated);

      // Always keep the slot key aligned with the (possibly edited) Mistri.
      const subData: Prisma.MistriSubscriptionUpdateInput = {
        state: updated.state,
        city: updated.city,
        category: updated.category,
      };

      if (plan && plan !== sub.plan) {
        if (plan === "FREE") {
          // Release the paid top slot.
          subData.plan = "FREE";
          subData.priceInr = 0;
          subData.startsAt = null;
          subData.expiresAt = null;
        } else {
          subData.plan = "PAID";
          subData.priceInr = PAID_PLAN_PRICE_INR;
          if (updated.status === "APPROVED") {
            // Already live — claim the slot now if it is free.
            await assertPaidSlotFree(tx, {
              mistriId: id,
              state: updated.state,
              city: updated.city,
              category: updated.category,
              now,
            });
            subData.startsAt = now;
            subData.expiresAt = paidPlanExpiryFrom(now);
          } else {
            // Still pending — record intent; the slot is claimed on approval.
            subData.startsAt = null;
            subData.expiresAt = null;
          }
        }
      } else if (
        sub.plan === "PAID" &&
        sub.expiresAt != null &&
        sub.expiresAt.getTime() > now.getTime() &&
        (sub.state !== updated.state ||
          sub.city !== updated.city ||
          sub.category !== updated.category)
      ) {
        // Plan unchanged, but an active paid holder is being moved to a new
        // area — make sure that area's slot is not already taken.
        await assertPaidSlotFree(tx, {
          mistriId: id,
          state: updated.state,
          city: updated.city,
          category: updated.category,
          now,
        });
      }

      await tx.mistriSubscription.update({ where: { mistriId: id }, data: subData });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "MISTRI_UPDATED",
          entityType: "Mistri",
          entityId: String(id),
          details: plan ? { plan } : undefined,
        },
      });

      return updated;
    });

    const info = await subscriptionInfoByMistriId([id]);
    response.status(200).json({ success: true, data: withSubscription(presentMistri(mistri), info) });
  } catch (error) {
    if (error instanceof PaidSlotTakenError) {
      response.status(409).json({ success: false, message: paidSlotTakenMessage(error) });
      return;
    }
    next(error);
  }
}

export async function approveMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = parseMistriId(request.params.id);
  if (!id) {
    response.status(400).json({ success: false, message: "Invalid Mistri ID." });
    return;
  }

  try {
    const admin = response.locals.admin as SafeAdmin;
    const existing = await prisma.mistri.findUnique({
      where: { id },
      select: { status: true, state: true, city: true, category: true },
    });
    if (!existing) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }
    if (existing.status === "APPROVED") {
      response.status(409).json({ success: false, message: "This Mistri is already approved." });
      return;
    }

    const now = new Date();
    const mistri = await prisma.$transaction(async (tx) => {
      const sub = await ensureSubscription(tx, { id, ...existing });

      if (sub.plan === "PAID") {
        await assertPaidSlotFree(tx, {
          mistriId: id,
          state: existing.state,
          city: existing.city,
          category: existing.category,
          now,
        });
        await tx.mistriSubscription.update({
          where: { mistriId: id },
          data: {
            priceInr: PAID_PLAN_PRICE_INR,
            startsAt: now,
            expiresAt: paidPlanExpiryFrom(now),
            state: existing.state,
            city: existing.city,
            category: existing.category,
          },
        });
      }

      const updated = await tx.mistri.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: now },
        select: adminMistriSelect,
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "MISTRI_APPROVED",
          entityType: "Mistri",
          entityId: String(id),
          details: sub.plan === "PAID" ? { plan: "PAID" } : undefined,
        },
      });

      return updated;
    });

    const info = await subscriptionInfoByMistriId([id]);
    response.status(200).json({
      success: true,
      message: "Mistri approved and published successfully.",
      mistri: withSubscription(presentMistri(mistri), info),
    });
  } catch (error) {
    if (error instanceof PaidSlotTakenError) {
      response.status(409).json({ success: false, message: paidSlotTakenMessage(error) });
      return;
    }
    next(error);
  }
}

export async function deleteAdminMistri(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = parseMistriId(request.params.id);
  if (!id) {
    response.status(400).json({ success: false, message: "Invalid Mistri ID." });
    return;
  }

  const validation = rejectMistriSchema.safeParse(request.body ?? {});
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "The rejection reason is too long.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const admin = response.locals.admin as SafeAdmin;
    const mistri = await prisma.mistri.findUnique({
      where: { id },
      select: { profilePhotoPublicId: true, galleryImages: true, status: true },
    });
    if (!mistri) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }

    const publicIds = [
      ...(mistri.profilePhotoPublicId ? [mistri.profilePhotoPublicId] : []),
      ...galleryPublicIds(mistri.galleryImages),
    ];

    await prisma.$transaction([
      // Free the paid slot (if any) — there is no FK cascade from the Mistri row.
      prisma.mistriSubscription.deleteMany({ where: { mistriId: id } }),
      prisma.mistri.delete({ where: { id } }),
      prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: mistri.status === "PENDING" ? "MISTRI_REJECTED_AND_DELETED" : "MISTRI_DELETED",
          entityType: "Mistri",
          entityId: String(id),
          details: validation.data.reason ? { reason: validation.data.reason } : undefined,
        },
      }),
    ]);

    await removeStoredImages(publicIds);
    response.status(200).json({ success: true, message: "Mistri record permanently deleted." });
  } catch (error) {
    next(error);
  }
}
