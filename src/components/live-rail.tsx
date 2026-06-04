"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SpotifyResult } from "@/lib/spotify";

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
 * Low-visibility left rail showing just what I'm listening to right now (Spotify),
 * xl+ and homepage only. Sits quietly at ~45% opacity, brightens on hover. The
 * book shelf and GitHub live in their own sections, so they're not duplicated here.
 */
export function LiveRail() {
  const spotify = useJson<SpotifyResult>("/api/spotify");
  const track = spotify?.track;

  if (!track) return null;

  return (
    <aside
      aria-label="Now playing"
      className="fixed left-5 top-1/2 z-30 hidden w-44 -translate-y-1/2 flex-col gap-5 opacity-45 transition-opacity duration-300 hover:opacity-100 xl:flex"
    >
      <Row label={MODE_LABEL[spotify!.mode] ?? "spotify"}>
        <Link href={track.url} target="_blank" data-cursor className="block hover:text-foreground">
          <span className="line-clamp-1 font-medium">{track.title}</span>
          <span className="line-clamp-1 text-muted-foreground">{track.artist}</span>
        </Link>
      </Row>
    </aside>
  );
}
