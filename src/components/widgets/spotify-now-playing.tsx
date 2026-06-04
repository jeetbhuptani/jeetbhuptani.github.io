"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SpotifyResult } from "@/lib/spotify";
import { WidgetShell } from "@/components/widgets/widget-shell";

const MODE_LABEL: Record<string, string> = {
  now: "Now playing",
  recent: "Last played",
  top: "On repeat",
};

export function SpotifyNowPlaying() {
  const [data, setData] = useState<SpotifyResult | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/spotify")
        .then((r) => r.json())
        .then((d) => active && setData(d))
        .catch(() => active && setFailed(true));
    };
    const schedule = () => {
      // Poll slower than the route's 30s revalidate; pause while tab hidden.
      timer.current = setTimeout(() => {
        if (!document.hidden) load();
        schedule();
      }, 75_000);
    };
    load();
    schedule();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const loading = !data && !failed;
  const errored = failed || data?.status === "error";
  const track = data?.track ?? null;
  const empty = !loading && !errored && !track;

  return (
    <WidgetShell
      label="Spotify"
      loading={loading}
      error={errored ? "Couldn’t load Spotify." : undefined}
      empty={empty ? "Not playing right now." : undefined}
    >
      {track ? (
        <Link
          href={track.url}
          target="_blank"
          data-cursor
          className="group/track flex items-center gap-3"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
            {track.image ? (
              <Image src={track.image} alt={track.album ?? track.title} fill sizes="48px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {track.isPlaying ? (
                <span className="flex items-end gap-[2px]" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-[2px] animate-pulse rounded-full bg-brand"
                      style={{ height: 6 + i * 3, animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              ) : null}
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {MODE_LABEL[data!.mode] ?? "Spotify"}
              </span>
            </div>
            <p className="truncate text-sm font-medium group-hover/track:text-brand">{track.title}</p>
            <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
          </div>
        </Link>
      ) : (
        <span />
      )}
    </WidgetShell>
  );
}
