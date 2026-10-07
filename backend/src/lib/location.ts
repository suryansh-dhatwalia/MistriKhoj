/**
 * "Uttar Pradesh" -> "uttar-pradesh". Used to make location filters in shareable
 * URLs (`/mistris?state=uttar-pradesh&city=gorakhpur`) match the stored names
 * regardless of case, spacing or punctuation.
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** True when two location names or slugs refer to the same place. */
export function sameLocation(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return slugify(a) === slugify(b);
}
