import { createCrudController } from "../lib/crud-controller.js";
import { prisma } from "../lib/prisma.js";
import {
  removeStoredImages,
  removeStoredVideos,
  storeImage,
  storeVideo,
} from "../services/image.service.js";
import { isVideoDataUri } from "../schemas/shared.js";
import { HttpError } from "../utils/http-error.js";
import {
  adRequestAdminUpdateSchema,
  adRequestListQuerySchema,
  adRequestPublicSchema,
  advertisementListQuerySchema,
  advertisementSchema,
  categoryListQuerySchema,
  categorySchema,
  cityListQuerySchema,
  citySchema,
  planListQuerySchema,
  planSchema,
  referralListQuerySchema,
  referralSchema,
  stateListQuerySchema,
  stateSchema,
  testimonialListQuerySchema,
  testimonialSchema,
} from "../schemas/content.schema.js";

type AnyRecord = Record<string, unknown>;

/**
 * Shared "upload one image column" behaviour for resources that carry a Cloudinary asset.
 * `inputKey` is the write-request field; it is replaced by `<urlColumn>` + `<publicIdColumn>`.
 * A plain https URL that is unchanged is left alone so the stored public id is preserved.
 */
function imageColumn(config: {
  inputKey: string;
  urlColumn: string;
  publicIdColumn: string;
  folder: string;
}) {
  const { inputKey, urlColumn, publicIdColumn, folder } = config;

  const toData = async (input: AnyRecord, existing?: AnyRecord): Promise<AnyRecord> => {
    const { [inputKey]: image, ...rest } = input;
    const data: AnyRecord = { ...rest };

    if (typeof image === "string" && image.length > 0) {
      const unchanged = existing != null && image === existing[urlColumn];
      if (!unchanged) {
        const stored = await storeImage(image, folder);
        data[urlColumn] = stored.url;
        data[publicIdColumn] = stored.publicId;
      }
    }
    return data;
  };

  return {
    existingSelectForWrite: { id: true, [urlColumn]: true, [publicIdColumn]: true } as AnyRecord,
    toCreateData: (input: AnyRecord) => toData(input),
    toUpdateData: (input: AnyRecord, existing: AnyRecord) => toData(input, existing),
    onAfterUpdate: async (updated: AnyRecord, previous: AnyRecord) => {
      const previousId = previous[publicIdColumn];
      if (typeof previousId === "string" && previousId && previousId !== updated[publicIdColumn]) {
        await removeStoredImages([previousId]);
      }
    },
    onAfterDelete: async (existing: AnyRecord) => {
      const publicId = existing[publicIdColumn];
      if (typeof publicId === "string" && publicId) {
        await removeStoredImages([publicId]);
      }
    },
  };
}

/**
 * Blocks a hard delete while registered Mistris still reference the row (Mistri.state /
 * .city / .category are denormalised strings, so there is no FK to stop this). The admin
 * is told to set the row Inactive instead, which hides it from the public site without
 * orphaning anyone.
 */
function blockDeleteWhenReferenced(
  entity: string,
  countReferencing: (existing: Record<string, unknown>) => Promise<number>,
) {
  return async (existing: Record<string, unknown>): Promise<void> => {
    const count = await countReferencing(existing);
    if (count > 0) {
      throw new HttpError(
        409,
        `${count} registered ${count === 1 ? "technician is" : "technicians are"} still linked to this ${entity}. ` +
          `Set it to Inactive to hide it from the public site instead of deleting it.`,
      );
    }
  };
}

export const stateController = createCrudController({
  model: "state",
  auditEntity: "State",
  createSchema: stateSchema,
  updateSchema: stateSchema,
  listQuerySchema: stateListQuerySchema,
  searchableFields: ["name", "code"],
  defaultOrderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  existingSelectForWrite: { id: true, name: true },
  beforeDelete: blockDeleteWhenReferenced("state", (existing) =>
    prisma.mistri.count({ where: { state: String(existing.name) } }),
  ),
});

export const cityController = createCrudController({
  model: "city",
  auditEntity: "City",
  createSchema: citySchema,
  updateSchema: citySchema,
  listQuerySchema: cityListQuerySchema,
  searchableFields: ["name"],
  defaultOrderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  include: { state: { select: { id: true, name: true } } },
  buildWhere: (query) => (query.stateId ? { stateId: Number(query.stateId) } : {}),
  existingSelectForWrite: { id: true, name: true, state: { select: { name: true } } },
  beforeDelete: blockDeleteWhenReferenced("city", (existing) => {
    const stateName = (existing.state as { name?: string } | null)?.name;
    return prisma.mistri.count({
      where: { city: String(existing.name), ...(stateName ? { state: stateName } : {}) },
    });
  }),
});

export const categoryController = createCrudController({
  model: "category",
  auditEntity: "Category",
  createSchema: categorySchema,
  updateSchema: categorySchema,
  listQuerySchema: categoryListQuerySchema,
  searchableFields: ["name", "slug"],
  defaultOrderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  existingSelectForWrite: { id: true, name: true },
  beforeDelete: blockDeleteWhenReferenced("category", (existing) =>
    prisma.mistri.count({ where: { category: String(existing.name) } }),
  ),
  transform: (row) => ({
    ...row,
    popularServices: Array.isArray(row.popularServices) ? row.popularServices : [],
  }),
});

/**
 * An Advertisement carries a single creative that is either an image or a video.
 * The write request may send `image` and/or `video` (an https URL to keep, or a
 * base64 data URL to upload). Whichever is supplied wins; the other column is
 * cleared. There is no `videoPublicId` column, so a video's Cloudinary id is kept
 * in `imagePublicId` (free, since a video ad has no image) and cleanup picks the
 * resource type from whether `videoUrl` is set.
 */
async function adMediaToData(input: AnyRecord, existing?: AnyRecord): Promise<AnyRecord> {
  const { image, video, ...rest } = input;
  const data: AnyRecord = { ...rest };

  const nextVideo = typeof video === "string" && video.length > 0 ? video : "";
  const nextImage = typeof image === "string" && image.length > 0 ? image : "";

  if (nextVideo) {
    if (existing == null || nextVideo !== existing.videoUrl) {
      const stored = isVideoDataUri(nextVideo)
        ? await storeVideo(nextVideo, "mistrikhoj/ads")
        : { url: nextVideo, publicId: null };
      data.videoUrl = stored.url;
      data.imagePublicId = stored.publicId;
      data.imageUrl = null;
    }
  } else if (nextImage) {
    if (existing == null || nextImage !== existing.imageUrl) {
      const stored = await storeImage(nextImage, "mistrikhoj/ads");
      data.imageUrl = stored.url;
      data.imagePublicId = stored.publicId;
      data.videoUrl = null;
    }
  }

  return data;
}

async function removeAdCreative(row: AnyRecord): Promise<void> {
  const publicId = row.imagePublicId;
  if (typeof publicId !== "string" || !publicId) return;
  if (typeof row.videoUrl === "string" && row.videoUrl) {
    await removeStoredVideos([publicId]);
  } else {
    await removeStoredImages([publicId]);
  }
}

const adMedia = {
  existingSelectForWrite: { id: true, imageUrl: true, imagePublicId: true, videoUrl: true } as AnyRecord,
  toCreateData: (input: AnyRecord) => adMediaToData(input),
  toUpdateData: (input: AnyRecord, existing: AnyRecord) => adMediaToData(input, existing),
  onAfterUpdate: async (updated: AnyRecord, previous: AnyRecord) => {
    if (
      typeof previous.imagePublicId === "string" &&
      previous.imagePublicId &&
      previous.imagePublicId !== updated.imagePublicId
    ) {
      await removeAdCreative(previous);
    }
  },
  onAfterDelete: (existing: AnyRecord) => removeAdCreative(existing),
};

export const advertisementController = createCrudController({
  model: "advertisement",
  auditEntity: "Advertisement",
  createSchema: advertisementSchema,
  updateSchema: advertisementSchema,
  listQuerySchema: advertisementListQuerySchema,
  searchableFields: ["title", "companyName", "category", "city", "state"],
  defaultOrderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  buildWhere: (query) => (query.placement ? { placement: query.placement } : {}),
  ...adMedia,
});

const testimonialImage = imageColumn({
  inputKey: "avatar",
  urlColumn: "avatarUrl",
  publicIdColumn: "avatarPublicId",
  folder: "mistrikhoj/testimonials",
});

export const testimonialController = createCrudController({
  model: "testimonial",
  auditEntity: "Testimonial",
  createSchema: testimonialSchema,
  updateSchema: testimonialSchema,
  listQuerySchema: testimonialListQuerySchema,
  searchableFields: ["author", "location", "technicianName", "serviceCategory"],
  defaultOrderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  ...testimonialImage,
});

export const planController = createCrudController({
  model: "subscriptionPlan",
  auditEntity: "SubscriptionPlan",
  createSchema: planSchema,
  updateSchema: planSchema,
  listQuerySchema: planListQuerySchema,
  searchableFields: ["name", "slug", "badge"],
  defaultOrderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  transform: (row) => ({ ...row, features: Array.isArray(row.features) ? row.features : [] }),
});

export const referralController = createCrudController({
  model: "referral",
  auditEntity: "Referral",
  createSchema: referralSchema,
  updateSchema: referralSchema,
  listQuerySchema: referralListQuerySchema,
  searchableFields: ["code", "name", "phone"],
  defaultOrderBy: [{ createdAt: "desc" }],
});

export const adRequestController = createCrudController({
  model: "adRequest",
  auditEntity: "AdRequest",
  // createSchema is unused — ad requests are created only by the public /api/advertise route.
  createSchema: adRequestPublicSchema,
  updateSchema: adRequestAdminUpdateSchema,
  listQuerySchema: adRequestListQuerySchema,
  searchableFields: ["companyName", "email", "contactNumber"],
  defaultOrderBy: [{ createdAt: "desc" }],
  existingSelectForWrite: { id: true, creativePublicId: true },
  onAfterDelete: async (existing) => {
    const publicId = existing.creativePublicId;
    if (typeof publicId === "string" && publicId) {
      await removeStoredImages([publicId]);
    }
  },
});
