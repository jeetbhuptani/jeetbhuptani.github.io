"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { ShelfBook, ShelfResult } from "@/lib/books";

/**
 * The bookshelf teaser on the home page: what I'm reading *right now*, not the
 * whole shelf.
 *
 * The full grid moved to /bookshelf. Showing forty covers here was a lot of
 * height and a lot of image requests to say something the dedicated page says
 * better — and it buried the one part that actually changes week to week.
 * If nothing is in progress, the most recent finish stands in so the panel is
 * never empty.
 */
export function ReadingNow() {
  const [data, setData] = useState<ShelfResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/bookshelf")
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  if (!data && !failed) {
    return (
      <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="h-[132px] w-[88px] shrink-0 animate-pulse rounded-md bg-secondary" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
        </div>
      </div>
    );
  }

  if (failed || data?.status === "error") {
    return <p className="text-xs text-muted-foreground">Couldn&rsquo;t load the shelf.</p>;
  }

  const books = data?.books ?? [];
  const reading = books.filter((b) => b.status === "reading");
  // Nothing in progress: fall back to the most recent finish rather than an
  // empty panel. `books` arrives newest-first from the API.
  const shown = reading.length ? reading : books.slice(0, 1);
  const isFallback = !reading.length;

  if (!shown.length) {
    return <p className="text-xs text-muted-foreground">The shelf is empty right now.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {isFallback ? "Last finished" : shown.length > 1 ? "Reading now" : "Reading now"}
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shown.map((book) => (
          <ReadingCard key={book.title} book={book} inProgress={!isFallback} />
        ))}
      </ul>
    </div>
  );
}

function ReadingCard({ book, inProgress }: { book: ShelfBook; inProgress: boolean }) {
  return (
    <li className="group flex gap-3.5 rounded-2xl border border-border bg-card p-3.5">
      <div
        className="relative h-[132px] w-[88px] shrink-0 overflow-hidden rounded-md border border-border/80 bg-secondary shadow-[0_1px_2px_rgb(0_0_0/0.28)] transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-1"
        style={book.accent ? { backgroundColor: book.accent } : undefined}
      >
        {book.cover ? (
          <Image src={book.cover} alt="" fill sizes="88px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center p-1.5 text-center font-mono text-[8px] leading-tight text-muted-foreground">
            {book.title}
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-black/35 to-transparent"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1 self-center">
        {inProgress ? (
          <span className="w-fit rounded-sm bg-secondary px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
            in progress
          </span>
        ) : null}
        <p className="text-sm font-medium leading-snug">{book.title}</p>
        <p className="text-xs text-muted-foreground">{book.author}</p>
        {book.genre ? (
          <p className="font-mono text-[10px] text-muted-foreground/70">{book.genre}</p>
        ) : null}
      </div>
    </li>
  );
}
