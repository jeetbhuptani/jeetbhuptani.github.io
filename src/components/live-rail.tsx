"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SpotifyResult } from "@/lib/spotify";
import type { BooksResult } from "@/lib/books";
import type { GithubResult } from "@/lib/github";

const MODE_LABEL: Record<string, string> = {
  now: "now playing",
  recent: "last played",
  top: "on repeat",
};

function useJson<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let active = true;
    fetch(url)
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [url]);
  return data;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="text-[11px] leading-snug">{children}</div>
    </div>
  );
}

/**
 * Low-visibility left rail of "what I'm into right now" — Spotify, current book,
 * GitHub — as compact one-liners (xl+ only, homepage). Sits quietly at ~45%
 * opacity and brightens on hover. Replaces the bulky "Currently" section; the
 * full shelf and GitHub views live in their own sections.
 */
export function LiveRail() {
  const spotify = useJson<SpotifyResult>("/api/spotify");
  const books = useJson<BooksResult>("/api/books");
  const github = useJson<GithubResult>("/api/github");

  const track = spotify?.track;
  const book = books?.books?.[0];
  const contributions = github?.total;

  return (
    <aside
      aria-label="Currently"
      className="fixed left-5 top-1/2 z-30 hidden w-44 -translate-y-1/2 flex-col gap-5 opacity-45 transition-opacity duration-300 hover:opacity-100 xl:flex"
    >
      {track ? (
        <Row label={MODE_LABEL[spotify!.mode] ?? "spotify"}>
          <Link href={track.url} target="_blank" data-cursor className="block hover:text-foreground">
            <span className="line-clamp-1 font-medium">{track.title}</span>
            <span className="line-clamp-1 text-muted-foreground">{track.artist}</span>
          </Link>
        </Row>
      ) : null}

      {book ? (
        <Row label="reading">
          <span className="line-clamp-2">
            <span className="font-medium">{book.title}</span>
            <span className="text-muted-foreground"> — {book.author}</span>
          </span>
        </Row>
      ) : null}

      {contributions ? (
        <Row label="github">
          <Link
            href="https://github.com/jeetbhuptani"
            target="_blank"
            data-cursor
            className="hover:text-foreground"
          >
            <span className="font-medium">{contributions.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">contributions this year</span>
          </Link>
        </Row>
      ) : null}
    </aside>
  );
}
