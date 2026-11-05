import { slugify } from "./location.js";

/** A Mistri may list up to this many extra trades besides the primary category. */
export const MAX_EXTRA_CATEGORIES = 4;

/**
 * Cleans the extra categories chosen for a Mistri: trims, drops blanks, removes
 * duplicates and the primary category (compared by slug, so case and spacing do not
 * matter), and keeps at most {@link MAX_EXTRA_CATEGORIES}. Order is preserved.
 */
export function normalizeExtraCategories(primary: string, extras: readonly string[]): string[] {
  const seen = new Set([slugify(primary)]);
  const result: string[] = [];
  for (const raw of extras) {
    const name = raw.trim().replace(/\s+/g, " ");
    const key = slugify(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
    if (result.length === MAX_EXTRA_CATEGORIES) break;
  }
  return result;
}
