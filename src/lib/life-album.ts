import type { LifeEntry } from "@/lib/content/types";

/**
 * Pure helpers behind the /life album. Kept out of the page so the ordering
 * rules — the only real logic on that route — can be tested without rendering.
 */

/**
 * Year pulled out of the free-text date label ("8th May 2026" -> 2026).
 *
 * `date_label` is deliberately fuzzy prose ("last summer", "Aug 2026") and
 * there is no date column to sort on, so a four-digit year is the only
 * chronology the data carries. Anything without one is undated, not year zero.
 */
export function yearOf(label: string | null | undefined): number | null {
  const match = label?.match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

export type Chapter = { year: number | null; items: LifeEntry[] };

/**
 * Splits the album into year chapters, newest first, with the undated ones
 * gathered at the end.
 *
 * Sorting on the parsed year rather than `sort_order` is what makes the page a
 * timeline instead of a wall: a memory lands in the right year even when it was
 * added out of order. Within a year the incoming order is preserved, so
 * `sort_order` from /admin still decides the sequence of a single day's photos.
 */
export function chapters(entries: readonly LifeEntry[]): Chapter[] {
  const byYear = new Map<number | null, LifeEntry[]>();

  for (const entry of entries) {
    const year = yearOf(entry.date_label);
    const bucket = byYear.get(year);
    if (bucket) bucket.push(entry);
    else byYear.set(year, [entry]);
  }

  return Array.from(byYear, ([year, items]) => ({ year, items })).sort((a, b) => {
    if (a.year === null) return 1;
    if (b.year === null) return -1;
    return b.year - a.year;
  });
}

/** The years an album spans, for the one line of data under the title. */
export function span(entries: readonly LifeEntry[]): { from: number; to: number } | null {
  const years = entries
    .map((e) => yearOf(e.date_label))
    .filter((y): y is number => y !== null);
  return years.length ? { from: Math.min(...years), to: Math.max(...years) } : null;
}

/**
 * How much of the column a print takes up, decided by the shape of the
 * photograph itself.
 *
 * A panorama earns the full measure; a 9:16 phone photo at that width would be
 * taller than the viewport and turn scrolling into work. Letting each picture's
 * own proportions set its footprint is what keeps the column from reading as a
 * grid — the ragged right edge is the point, not a side effect.
 */
export function printWidth(ratio: number): string {
  if (ratio >= 1.9) return "100%";
  if (ratio >= 1.15) return "90%";
  if (ratio >= 0.85) return "68%";
  if (ratio >= 0.6) return "56%";
  return "46%";
}
