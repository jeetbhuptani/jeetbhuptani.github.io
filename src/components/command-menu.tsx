"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Links" | "Actions";
  run: () => void;
};

function scrollToId(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Command menu + single-key section hotkeys (R29, gxuri-style). Additive to the
 * normal nav — links and scrolling still work without it. ⌘K / Ctrl-K / "/"
 * opens the palette; single letters jump to sections when not typing in a field.
 */
export function CommandMenu({
  socials = [],
}: {
  /** Passed from the server layout — this is a client component and cannot
   *  read the database itself. */
  socials?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTheme, resolvedTheme } = useTheme();

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: "top", label: "Top", hint: "h", group: "Navigate", run: () => scrollToId("top") },
      { id: "about", label: "About", hint: "a", group: "Navigate", run: () => scrollToId("about") },
      { id: "work", label: "Work", hint: "w", group: "Navigate", run: () => scrollToId("work") },
      { id: "products", label: "Products", hint: "p", group: "Navigate", run: () => scrollToId("products") },
      // Bookshelf and Life are only a tab on the home page now; the full
      // versions are real routes, so jump there rather than to the teaser.
      { id: "bookshelf", label: "Bookshelf", hint: "r", group: "Navigate", run: () => (window.location.href = "/bookshelf") },
      { id: "life", label: "Life", hint: "l", group: "Navigate", run: () => (window.location.href = "/life") },
      { id: "hackathons", label: "Hackathons", hint: "k", group: "Navigate", run: () => scrollToId("hackathons") },
      { id: "contact", label: "Contact", hint: "c", group: "Navigate", run: () => scrollToId("contact") },
      { id: "blog", label: "Blog", hint: "b", group: "Navigate", run: () => (window.location.href = "/blog") },
    ];
    const links: Item[] = socials.map((s) => ({
      id: `link-${s.label}`,
      label: s.label,
      group: "Links" as const,
      run: () => window.open(s.href, "_blank"),
    }));
    const actions: Item[] = [
      {
        id: "theme",
        label: "Toggle theme",
        hint: "t",
        group: "Actions",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
    return [...nav, ...links, ...actions];
    // `socials` belongs here: the memo closes over it, so omitting it would
    // pin the Links group to whatever the first render happened to receive.
  }, [resolvedTheme, setTheme, socials]);

  const hotkeys = useMemo(() => {
    const map: Record<string, Item> = {};
    items.forEach((it) => it.hint && (map[it.hint] = it));
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global key handling: open palette, or fire section hotkeys when idle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (open || typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const hit = hotkeys[e.key.toLowerCase()];
      if (hit) {
        e.preventDefault();
        hit.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hotkeys]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="fixed right-4 top-4 z-[55] hidden items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground sm:flex"
      >
        <kbd className="text-foreground">⌘K</kbd>
        <span className="text-border">/</span>
        <span>menu</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-background/60 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const it = filtered[active];
              if (it) {
                it.run();
                close();
              }
            }
          }}
          placeholder="Jump to… (type to filter)"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {filtered.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  it.run();
                  close();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                  i === active ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                <span>{it.label}</span>
                {it.hint ? (
                  <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                    {it.hint}
                  </kbd>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">{it.group}</span>
                )}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">No matches.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
