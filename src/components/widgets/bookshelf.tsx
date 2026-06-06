"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ShelfResult } from "@/lib/books";

/**
 * The whole shelf (plan U13 extended): every book read + currently reading,
 * from Hardcover. Currently-reading covers carry a small tag. Explicit
 * loading / empty / error states.
 */
export function Bookshelf() {
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

  const loading = !data && !failed;
  const errored = failed || data?.status === "error";
  const books = data?.books ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-secondary" />
        ))}
      </div>
    );
  }
  if (errored) return <p className="text-xs text-muted-foreground">Couldn’t load the shelf.</p>;
  if (!books.length) return <p className="text-xs text-muted-foreground">The shelf is empty right now.</p>;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {books.map((b) => (
        <div key={b.title} className="group flex flex-col gap-1.5">
          <div
            className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-secondary"
            style={b.accent ? { backgroundColor: b.accent } : undefined}
            title={`${b.title} — ${b.author}`}
          >
            {b.cover ? (
              <Image
                src={b.cover}
                alt={b.title}
                fill
                sizes="(min-width: 640px) 18vw, 30vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="flex h-full items-center justify-center p-1 text-center text-[9px] text-muted-foreground">
                {b.title}
              </span>
            )}
            {b.status === "reading" ? (
              <span className="absolute left-1 top-1 rounded bg-background/85 px-1 py-0.5 text-[8px] uppercase tracking-wide text-foreground backdrop-blur">
                reading
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
