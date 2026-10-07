import { z } from "zod";

/** Free-text filter: trimmed, empty becomes undefined, capped so it cannot be abused. */
const filterText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

/**
 * Query for the public Mistri directory. When neither `page` nor `pageSize` is sent the
 * endpoint keeps its original behaviour (every approved Mistri, unpaginated).
 */
export const publicMistriQuerySchema = z.object({
  state: filterText(100),
  city: filterText(100),
  category: filterText(140),
  q: filterText(100),
  minExp: z.coerce.number().int().min(0).max(80).optional().catch(undefined),
  sort: z.enum(["random", "newest", "rating", "experience"]).default("random").catch("random"),
  /** Per-visit shuffle seed; keeps the random order stable across pages. */
  seed: filterText(40),
  page: z.coerce.number().int().min(1).max(10_000).optional().catch(undefined),
  pageSize: z.coerce.number().int().min(1).max(50).optional().catch(undefined),
});
export type PublicMistriQuery = z.infer<typeof publicMistriQuerySchema>;
