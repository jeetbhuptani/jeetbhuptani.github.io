"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { BooksResult } from "@/lib/books";
import { WidgetShell } from "@/components/widgets/widget-shell";

export function CurrentlyReading() {
  const [data, setData] = useState<BooksResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/books")
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

  return (
    <WidgetShell
      label="Reading"
      loading={loading}
      empty={!loading && !errored && books.length === 0 ? "Nothing on the shelf right now." : undefined}
      error={errored ? "Couldn’t load books." : undefined}
    >
      <ul className="flex flex-col gap-3">
        {books.slice(0, 3).map((b) => (
          <li key={b.title} className="flex items-center gap-3">
            <div
              className="relative h-14 w-10 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary"
              style={b.accent ? { backgroundColor: b.accent } : undefined}
            >
              {b.cover ? (
                <Image src={b.cover} alt={b.title} fill sizes="40px" className="object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">{b.author}</p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
