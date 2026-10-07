/**
 * Deterministic per-visitor shuffle. Each browser session sends a random `seed`, so the
 * order differs between visits but stays stable while paging through one result list
 * (page 2 never repeats or skips a Mistri from page 1).
 */
export function shuffleRank(seed: string, id: number): number {
  // FNV-1a over "seed:id", mapped to [0, 1).
  let hash = 0x811c9dc5;
  for (const char of `${seed}:${id}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0x100000000;
}
