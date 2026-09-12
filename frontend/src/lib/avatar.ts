/**
 * Neutral "empty profile picture" (Facebook-style silhouette) shown wherever a
 * Mistri has not uploaded a profile photo. Inline SVG data URI so it needs no
 * network request and works in any <img src>.
 */
export const DEFAULT_AVATAR_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23E4E6EB'/%3E%3Ccircle cx='64' cy='48' r='24' fill='%23B0B3B8'/%3E%3Cpath d='M64 80c-25 0-41 15-41 34v14h82v-14c0-19-16-34-41-34z' fill='%23B0B3B8'/%3E%3C/svg%3E";

/** Returns the given photo URL, or the default silhouette when it is missing/blank. */
export const avatarOrDefault = (url?: string | null): string =>
  url && url.trim() !== "" ? url : DEFAULT_AVATAR_URI;
