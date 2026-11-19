// "Pick one for me": a single good option from the current results.
// Prefers places open at the trip time, then the nearest few, then random,
// so it feels like a suggestion and not always the same top result.

export type Candidate<T> = {
  item: T;
  // null when open/closed isn't known (no hours, or no time yet)
  open: boolean | null;
  // null without a starting point
  km: number | null;
};

// Only this many of the nearest open places are in the draw
export const NEAREST = 3;

export function pickOne<T>(
  candidates: Candidate<T>[],
  options: { avoid?: T; random?: () => number } = {},
): T | null {
  const { avoid, random = Math.random } = options;
  if (candidates.length === 0) return null;

  // Open beats unknown beats closed; closed only if nothing else is left
  const open = candidates.filter((c) => c.open === true);
  const unknown = candidates.filter((c) => c.open === null);
  let pool = open.length ? open : unknown.length ? unknown : candidates;

  // With distances, keep it close by
  if (pool.every((c) => c.km !== null)) {
    pool = [...pool]
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
      .slice(0, NEAREST);
  }

  // Pressing again shouldn't land on the same place, if there's a choice
  const fresh = pool.filter((c) => c.item !== avoid);
  if (fresh.length) pool = fresh;

  return pool[Math.floor(random() * pool.length)].item;
}
