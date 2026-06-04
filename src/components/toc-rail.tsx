"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog-utils";

/**
 * "On this page" as a fixed right-margin rail on post pages (xl+), mirroring the
 * left posts index — so it's browsable while reading. Tracks the heading in view
 * and highlights it. Hidden when there are too few headings or on small screens.
 */
export function TocRail({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id);

  useEffect(() => {
    if (headings.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="fixed right-5 top-1/2 z-40 hidden w-44 -translate-y-1/2 flex-col gap-2.5 xl:flex"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        On this page
      </span>
      <ul className="flex flex-col gap-2">
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li key={h.id} className={h.level === 3 ? "pl-3" : undefined}>
              <a
                href={`#${h.id}`}
                data-cursor
                onClick={() => setActive(h.id)}
                aria-current={on ? "true" : undefined}
                className={`flex items-center gap-1.5 text-xs leading-snug transition-colors ${
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={on ? "text-foreground" : "text-border"}>—</span>
                <span className="line-clamp-2">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
