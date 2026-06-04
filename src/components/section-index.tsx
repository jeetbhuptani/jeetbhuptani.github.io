"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { id: "hero", label: "top" },
  { id: "about", label: "about" },
  { id: "work", label: "work" },
  { id: "bookshelf", label: "bookshelf" },
  { id: "projects", label: "projects" },
  { id: "life", label: "life" },
  { id: "contact", label: "contact" },
];

/**
 * Fixed side index (right rail on desktop). Tracks the section in view and lets
 * the user jump directly to any section. Hidden on small screens; the command
 * menu + hotkeys cover navigation there.
 */
export function SectionIndex() {
  const [active, setActive] = useState("hero");
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome]);

  const jump = (id: string) => {
    setActive(id); // highlight immediately on click; observer keeps it in sync after
    if (id === "hero") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!onHome) return null;

  return (
    <nav
      aria-label="Section index"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1.5 lg:flex"
    >
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            data-cursor
            onClick={() => jump(s.id)}
            className="group flex items-center justify-end gap-2"
            aria-current={on ? "true" : undefined}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.15em] transition-all ${
                on ? "text-foreground" : "text-muted-foreground/0 group-hover:text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`h-px transition-all ${
                on ? "w-6 bg-foreground" : "w-3 bg-muted-foreground/40 group-hover:w-5 group-hover:bg-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
