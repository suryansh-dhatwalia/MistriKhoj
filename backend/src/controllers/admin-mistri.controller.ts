import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
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
  const where: Prisma.MistriWhereInput = {
    status: input.status,
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

  try {
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

    response.status(200).json({
      success: true,
      data: items.map(presentMistri),
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
    response.status(200).json({ success: true, data: presentMistri(mistri) });
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

  try {
    const admin = response.locals.admin as SafeAdmin;
    const existing = await prisma.mistri.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }

    const [mistri] = await prisma.$transaction([
      prisma.mistri.update({
        where: { id },
        data: validation.data,
        select: adminMistriSelect,
      }),
      prisma.adminAuditLog.create({
        data: { adminId: admin.id, action: "MISTRI_UPDATED", entityType: "Mistri", entityId: String(id) },
      }),
    ]);

    response.status(200).json({ success: true, data: presentMistri(mistri) });
  } catch (error) {
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
    const existing = await prisma.mistri.findUnique({ where: { id }, select: { status: true } });
    if (!existing) {
      response.status(404).json({ success: false, message: "Mistri registration not found." });
      return;
    }
    if (existing.status === "APPROVED") {
      response.status(409).json({ success: false, message: "This Mistri is already approved." });
      return;
    }

    const [mistri] = await prisma.$transaction([
      prisma.mistri.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: new Date() },
        select: adminMistriSelect,
      }),
      prisma.adminAuditLog.create({
        data: { adminId: admin.id, action: "MISTRI_APPROVED", entityType: "Mistri", entityId: String(id) },
      }),
    ]);

    response.status(200).json({
      success: true,
      message: "Mistri approved and published successfully.",
      mistri: presentMistri(mistri),
    });
  } catch (error) {
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
