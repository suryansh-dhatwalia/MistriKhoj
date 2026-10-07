/**
 * Layout contract for advertisement grids, shared by the homepage and the results page
 * so both always behave the same way:
 *  - one column on small phones, two columns from the `sm` breakpoint up;
 *  - ads fill row by row (1, 2 / 3, 4 / ...), never a single long horizontal strip;
 *  - every card has the same media frame (fixed aspect ratio) and stretches to the row height.
 */
export const AD_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6';

/** Fixed-ratio frame: reserves its space before the media loads, so nothing jumps. */
export const AD_MEDIA_FRAME_CLASS =
  'relative w-full aspect-[16/10] overflow-hidden bg-[#0D0F12]';

/** Foreground media is letter-boxed (never cropped, stretched or overflowing). */
export const AD_MEDIA_FIT_CLASS = 'absolute inset-0 h-full w-full object-contain';

/** Groups ads into display rows of two, e.g. [1,2,3,4,5] -> [[1,2],[3,4],[5]]. */
export function chunkIntoRows<T>(items: readonly T[], perRow = 2): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += perRow) {
    rows.push(items.slice(index, index + perRow));
  }
  return rows;
}
