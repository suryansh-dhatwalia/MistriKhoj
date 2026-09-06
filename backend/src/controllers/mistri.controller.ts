import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { mistriRegistrationSchema } from "../schemas/mistri.schema.js";
import { removeStoredImages, storeImage } from "../services/image.service.js";

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

    response.status(200).json({
      success: true,
      data: mistris.map((mistri) => ({
        ...mistri,
        servicesOffered: toStringArray(mistri.servicesOffered),
        galleryImages: toGalleryUrls(mistri.galleryImages),
      })),
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

    const profilePhoto = await storeImage(
      input.profilePhoto,
      "mistrikhoj/mistris/profile-photos",
    );

    if (profilePhoto.publicId) {
      uploadedPublicIds.push(profilePhoto.publicId);
    }

    const galleryImages = [];
    for (const image of input.galleryImages) {
      const storedImage = await storeImage(image, "mistrikhoj/mistris/gallery");
      galleryImages.push(storedImage);
      if (storedImage.publicId) {
        uploadedPublicIds.push(storedImage.publicId);
      }
    }

    const mistri = await prisma.mistri.create({
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
        referralCode: input.referralCode,
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

    response.status(201).json({
      success: true,
      message: "Mistri registration completed successfully.",
      data: mistri,
    });
  } catch (error) {
    await removeStoredImages(uploadedPublicIds);
    next(error);
  }
}
