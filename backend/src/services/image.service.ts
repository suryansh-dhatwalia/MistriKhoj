import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export type StoredImage = {
  url: string;
  publicId: string | null;
};

const hasCloudinaryConfiguration = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfiguration) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function storeImage(image: string, folder: string): Promise<StoredImage> {
  if (/^https?:\/\//i.test(image)) {
    return { url: image, publicId: null };
  }

  if (!hasCloudinaryConfiguration) {
    throw new HttpError(
      503,
      "Image uploading is not configured. Add the Cloudinary values to the backend .env file.",
    );
  }

  const result = await cloudinary.uploader.upload(image, {
    folder,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/** Uploads a base64 data URL (or passes through an https URL) as a Cloudinary video. */
export async function storeVideo(video: string, folder: string): Promise<StoredImage> {
  if (/^https?:\/\//i.test(video)) {
    return { url: video, publicId: null };
  }

  if (!hasCloudinaryConfiguration) {
    throw new HttpError(
      503,
      "Video uploading is not configured. Add the Cloudinary values to the backend .env file.",
    );
  }

  const result = await cloudinary.uploader.upload(video, {
    folder,
    resource_type: "video",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function removeStoredImages(publicIds: string[]): Promise<void> {
  if (!hasCloudinaryConfiguration || publicIds.length === 0) {
    return;
  }

  await Promise.allSettled(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
}

/** Deletes Cloudinary assets that were stored as videos (needs the video resource_type). */
export async function removeStoredVideos(publicIds: string[]): Promise<void> {
  if (!hasCloudinaryConfiguration || publicIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: "video" })),
  );
}
