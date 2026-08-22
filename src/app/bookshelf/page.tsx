import type { Metadata } from "next";

import { GenreShelf, applyOverrides } from "@/components/bookshelf/shelf";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/section";
import { getBookshelf } from "@/lib/books";
import { bookSlug, getBookOverrides, groupOrdered } from "@/lib/content";

export const metadata: Metadata = {
  title: "Bookshelf",
  description:
    "Every book I've read, shelved by genre — with my ratings where I've left them.",
};

/** Matches the Hardcover cache window in lib/books.ts. */
export const revalidate = 3600;

/** Genres with fewer than this many books are pooled into one shelf, so the
 *  page doesn't turn into a row of one-book shelves. Set to 2 because the
 *  shelf is currently ~11 books and Hardcover's genre tags are granular — at
 *  3 every single genre folded into "Everything else" and the shelves
 *  disappeared. Worth raising again once the collection grows. */
const MIN_SHELF_SIZE = 2;
const MISC_SHELF = "Everything else";

export default async function BookshelfPage() {
  const [shelf, overrides] = await Promise.all([getBookshelf(), getBookOverrides()]);
  const books = applyOverrides(shelf.books, overrides, bookSlug);

  const reading = books.filter((b) => b.status === "reading");
  const rated = books.filter((b) => b.rating).length;

  // Group by genre, then fold the thin shelves together.
  const raw = groupOrdered(books, (b) => b.genre ?? MISC_SHELF, []);
  const thick = raw.filter((g) => g.items.length >= MIN_SHELF_SIZE && g.key !== MISC_SHELF);
  const thin = raw.filter((g) => g.items.length < MIN_SHELF_SIZE || g.key === MISC_SHELF);
  const shelves = [
    ...thick.sort((a, b) => b.items.length - a.items.length),
    ...(thin.length
      ? [{ key: MISC_SHELF, items: thin.flatMap((g) => g.items) }]
      : []),
  ];

  return (
    <main className="flex flex-col gap-14">
      <Reveal>
        <header className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Bookshelf
          </span>
          <h1 className="text-glow font-sans text-3xl font-semibold tracking-tight sm:text-5xl">
            Everything I&rsquo;ve <span className="font-serif font-normal italic">read</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Shelved by genre, pulled live from Hardcover. Ratings show where I&rsquo;ve left
            one.
          </p>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-[11px] text-muted-foreground">
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular-nums text-foreground">{books.length}</dt>
              <dd>books</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular-nums text-foreground">{shelves.length}</dt>
              <dd>shelves</dd>
            </div>
            {reading.length ? (
              <div className="flex items-baseline gap-1.5">
                <dt className="tabular-nums text-foreground">{reading.length}</dt>
                <dd>reading now</dd>
              </div>
            ) : null}
            {rated ? (
              <div className="flex items-baseline gap-1.5">
                <dt className="tabular-nums text-foreground">{rated}</dt>
                <dd>rated</dd>
              </div>
            ) : null}
          </dl>
        </header>
      </Reveal>

      {shelf.status === "error" ? (
        <p className="text-sm text-muted-foreground">
          Couldn&rsquo;t reach Hardcover just now — the shelf will be back shortly.
        </p>
      ) : !books.length ? (
        <p className="text-sm text-muted-foreground">The shelf is empty right now.</p>
      ) : (
        <div className="space-y-10">
          {shelves.map((s) => (
            <GenreShelf key={s.key} genre={s.key} books={s.items} />
          ))}
        </div>
      )}

      {!rated && books.length ? (
        <Section id="ratings" label="Note">
          <p className="text-xs leading-relaxed text-muted-foreground">
            No ratings yet — Hardcover returns none for this account. They appear here
            automatically once set, either on Hardcover or from the admin panel.
          </p>
        </Section>
      ) : null}
    </main>
  );
}
