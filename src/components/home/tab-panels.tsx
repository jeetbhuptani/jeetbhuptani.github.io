"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type TabPanel = {
  id: string;
  label: string;
  /** Small right-aligned hint, e.g. "3 reading" — optional. */
  hint?: string;
  /** Rendered on the server and handed down; keeps data fetching off the client. */
  content: React.ReactNode;
};

/**
 * Two-or-more panels behind a tab strip.
 *
 * Bookshelf and Life used to be full home-page sections, which meant the page
 * carried two galleries most visitors scroll straight past. Collapsing them
 * into one section keeps both reachable without either paying for the other's
 * height.
 *
 * All panels are rendered on the server and passed in as `content`; the client
 * only decides which one is visible. Hidden panels stay mounted (`hidden`
 * attribute) so switching tabs never refetches or re-lays-out — the cost is
 * paid once, in HTML that was coming down the wire anyway.
 */
export function TabPanels({ tabs }: { tabs: TabPanel[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const reduce = useReducedMotion();
  const groupId = useId();

  return (
    <div>
      <div role="tablist" className="mb-4 flex flex-wrap items-center gap-1">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`${groupId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${groupId}-panel-${tab.id}`}
              data-cursor
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* The pill slides between tabs via a shared layoutId, so the
                  selection reads as one object moving rather than two fading. */}
              {selected ? (
                <motion.span
                  layoutId={`${groupId}-pill`}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-lg border border-border bg-card"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              {tab.label}
              {tab.hint ? (
                <span className="ml-1.5 tabular-nums text-muted-foreground/70">{tab.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${groupId}-panel-${tab.id}`}
          aria-labelledby={`${groupId}-tab-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
