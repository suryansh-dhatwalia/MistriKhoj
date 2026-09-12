import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import { adRequestAdminUpdateSchema, adRequestPublicSchema } from "../schemas/content.schema.js";
import { idParamSchema, isVideoDataUri } from "../schemas/shared.js";
import { storeImage, storeVideo } from "../services/image.service.js";

/** POST /api/advertise — public "Advertise With Us" form submission. */
export async function submitAdRequest(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = adRequestPublicSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the highlighted fields.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const input = validation.data;

  try {
    let creativeUrl: string | undefined;
    let creativePublicId: string | undefined;
    if (input.creative) {
      // A video ad's creative goes to Cloudinary as a video; everything else as an image.
      const stored =
        input.adType === "video" && isVideoDataUri(input.creative)
          ? await storeVideo(input.creative, "mistrikhoj/ad-requests")
          : await storeImage(input.creative, "mistrikhoj/ad-requests");
      creativeUrl = stored.url;
      creativePublicId = stored.publicId ?? undefined;
    }

    const created = await prisma.adRequest.create({
      data: {
        companyName: input.companyName,
        contactNumber: input.contactNumber,
        email: input.email,
        adType: input.adType,
        duration: input.duration,
        targetUrl: input.targetUrl,
        creativeUrl,
        creativePublicId,
        message: input.message,
      },
      select: { id: true, createdAt: true },
    });

    response.status(201).json({
      success: true,
      message:
        "Your advertising request has been received. Our team will review it and contact you within 24 hours.",
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/ad-requests/:id — change the request status. Approving it also
 * publishes a live Advertisement (homepage banner for image ads, video slot for video
 * ads) and links it back; moving away from APPROVED takes that ad offline again.
 */
export async function updateAdRequestStatus(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = idParamSchema.safeParse(request.params.id);
  if (!id.success) {
    response.status(400).json({ success: false, message: "Invalid ad request ID." });
    return;
  }

  const validation = adRequestAdminUpdateSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please pick a valid status.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  const admin = response.locals.admin as SafeAdmin;
  const nextStatus = validation.data.status;

  try {
    const existing = await prisma.adRequest.findUnique({ where: { id: id.data } });
    if (!existing) {
      response.status(404).json({ success: false, message: "Ad request not found." });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.adRequest.update({
        where: { id: id.data },
        data: { status: nextStatus },
      });

      let advertisementId = existing.advertisementId ?? null;
      let publishedNow = false;

      if (nextStatus === "APPROVED") {
        const linked = existing.advertisementId
          ? await tx.advertisement.findUnique({ where: { id: existing.advertisementId } })
          : null;

        if (linked) {
          await tx.advertisement.update({ where: { id: linked.id }, data: { status: "ACTIVE" } });
          advertisementId = linked.id;
        } else {
          const isVideo = existing.adType === "video";
          // Both image and video ad requests publish into the rotating homepage
          // banner — the public banner renders either creative type.
          const placement = "HOME_BANNER";
          const maxSort = await tx.advertisement.aggregate({
            where: { placement },
            _max: { sortOrder: true },
          });
          const hasCreative = Boolean(existing.creativeUrl);

          const ad = await tx.advertisement.create({
            data: {
              placement,
              companyName: existing.companyName,
              title: isVideo ? existing.companyName : null,
              linkUrl: existing.targetUrl,
              imageUrl: isVideo ? null : existing.creativeUrl,
              videoUrl: isVideo ? existing.creativeUrl : null,
              // No videoPublicId column — a video ad keeps its Cloudinary id in
              // imagePublicId (its imageUrl is null), matching the Banner Ads screen.
              imagePublicId: existing.creativePublicId,
              sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
              // Publish live when a creative was supplied, otherwise leave it as a
              // draft on the Banner Ads screen for the admin to finish.
              status: hasCreative ? "ACTIVE" : "INACTIVE",
            },
          });
          await tx.adRequest.update({
            where: { id: id.data },
            data: { advertisementId: ad.id },
          });
          advertisementId = ad.id;
          publishedNow = true;
        }
      }

      if (existing.status === "APPROVED" && nextStatus !== "APPROVED" && existing.advertisementId) {
        await tx.advertisement.updateMany({
          where: { id: existing.advertisementId },
          data: { status: "INACTIVE" },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: nextStatus === "APPROVED" ? "AD_REQUEST_APPROVED" : "AD_REQUEST_STATUS_CHANGED",
          entityType: "AdRequest",
          entityId: String(id.data),
          details: advertisementId ? { advertisementId, publishedNow } : undefined,
        },
      });

      return { ...updated, advertisementId };
    });

    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
