import Image from "next/image";

import type { BookOverride } from "@/lib/content/types";
import type { ShelfBook } from "@/lib/books";
import { cn } from "@/lib/utils";

/** A book after admin overrides have been layered over the Hardcover data. */
export type ResolvedBook = ShelfBook & { note?: string; featured?: boolean };

export function applyOverrides(
  books: ShelfBook[],
  overrides: Map<string, BookOverride>,
  slugOf: (title: string) => string
): ResolvedBook[] {
  return books.map((b) => {
    const o = overrides.get(slugOf(b.title));
    if (!o) return b;
    return {
      ...b,
      // Admin values win: Hardcover has no ratings for this account, and the
      // genre it picks is crowd-sourced and sometimes wrong.
      rating: o.rating ?? b.rating,
      genre: o.genre ?? b.genre,
      note: o.note ?? undefined,
      featured: o.featured,
    };
  });
}

/**
 * Five-star rating. Rendered as inline SVG rather than a font icon so it costs
 * no extra request, and as a single path per star so it stays cheap at the
 * ~40 books currently on the shelf.
 */
function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className="inline-flex items-center gap-px"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} viewBox="0 0 20 20" className="size-2.5" aria-hidden>
            <defs>
              {fill === 0.5 ? (
                <linearGradient id={`half-${i}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              ) : null}
            </defs>
            <path
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
              className={fill ? "text-foreground" : "text-border"}
              fill={fill === 0.5 ? `url(#half-${i})` : fill ? "currentColor" : "currentColor"}
              stroke={fill === 0.5 ? "currentColor" : "none"}
              strokeWidth={fill === 0.5 ? 1 : 0}
            />
          </svg>
        );
      })}
    </span>
  );
}

function Spine({ book }: { book: ResolvedBook }) {
  return (
    <figure className="group/book relative w-[74px] shrink-0 sm:w-[86px]">
      <div
        data-cursor
        className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-[3px] border border-border/80 bg-secondary",
          // The lift is the whole interaction: transform + shadow only, so it
          // stays on the compositor and never triggers layout.
          "shadow-[0_1px_2px_rgb(0_0_0/0.28)] transition-transform duration-200 ease-out",
          "will-change-transform group-hover/book:-translate-y-1.5"
        )}
        style={book.accent ? { backgroundColor: book.accent } : undefined}
      >
        {book.cover ? (
          <Image
            src={book.cover}
            alt=""
            fill
            sizes="86px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center p-1.5 text-center font-mono text-[8px] leading-tight text-muted-foreground">
            {book.title}
          </span>
        )}

        {/* Page-edge highlight down the fore-edge — sells the "book" read for
            one gradient and no extra element. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-black/35 to-transparent"
        />

        {book.status !== "read" ? (
          <span className="absolute left-1 top-1 rounded-sm bg-background/85 px-1 py-px font-mono text-[7px] uppercase tracking-wider text-foreground backdrop-blur-sm">
            {book.status === "reading" ? "reading" : "dnf"}
          </span>
        ) : null}
      </div>

      <figcaption className="mt-1.5 space-y-0.5">
        <p className="line-clamp-2 text-[10px] font-medium leading-tight">{book.title}</p>
        <p className="line-clamp-1 text-[9px] text-muted-foreground">{book.author}</p>
        {book.rating ? <Stars rating={book.rating} /> : null}
      </figcaption>
    </figure>
  );
}

/**
 * One genre shelf: a horizontal row of spines standing on a drawn plank.
 * Scrolls horizontally rather than wrapping, so a shelf reads as a shelf.
 */
export function GenreShelf({ genre, books }: { genre: string; books: ResolvedBook[] }) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-2.5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
          {genre}
        </h3>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {books.length}
        </span>
      </div>

      <div className="relative">
        <div className="flex items-end gap-2.5 overflow-x-auto pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {books.map((b) => (
            <Spine key={`${b.title}-${b.author}`} book={b} />
          ))}
        </div>
        {/* The plank. A 2px bar plus a soft shadow beneath it — no image. */}
        <div
          aria-hidden
          className="h-[3px] rounded-full bg-gradient-to-r from-border via-muted-foreground/40 to-border"
        />
        <div
          aria-hidden
          className="h-2 bg-gradient-to-b from-foreground/[0.07] to-transparent"
        />
      </div>
    </section>
  );
}
