/**
 * Pure helpers for the blog reading experience (plan U16). Operate on the
 * rendered HTML string the unified pipeline produces, so they stay testable and
 * don't change the pipeline output.
 */

export type Heading = { id: string; text: string; level: number };

/** Estimated reading time in minutes (~200 wpm), floored at 1. */
export function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** h2/h3 headings (with rehype-slug ids) for a table of contents. */
export function extractHeadings(html: string): Heading[] {
  const re = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({
      level: Number(m[1]),
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, "").trim(),
    });
  }
  return out;
}
