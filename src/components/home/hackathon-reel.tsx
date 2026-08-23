"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Collapsible hackathon timeline.
 *
 * Closed by default: five weekend projects is a lot of vertical space for
 * something most visitors skim, and the section sat between Life and Contact
 * where it pushed the call to action off the fold. Opening it draws the rail
 * downward and staggers the entries in behind it, so the timeline reads as a
 * timeline rather than a list that appeared all at once.
 *
 * The rail is animated with `scaleY` and the cards with `opacity`/`y` — both
 * compositor-only properties. The one layout-affecting animation is the
 * container height, which is unavoidable for a disclosure and only runs on an
 * explicit click.
 *
 * `items` arrives already rendered on the server. Taking the data and rendering
 * HackathonCard here instead would pull the whole icon set, the avatar and the
 * badge into the client bundle — it cost 12 kB of first-load JS on a section
 * that starts closed. This component only decides visibility and motion.
 */
export function HackathonReel({ items }: { items: React.ReactNode[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  if (!items.length) return null;

  // Under reduced motion the rail and cards appear at their final values; the
  // disclosure still works, it just doesn't move.
  const railTransition = reduce
    ? { duration: 0 }
    : { duration: 0.5, ease: EASE, delay: 0.05 };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor
        className="group flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors hover:border-foreground/25"
      >
        <span
          aria-hidden
          className={cn(
            "font-mono text-[10px] text-muted-foreground transition-transform duration-200",
            open && "rotate-90"
          )}
        >
          ▸
        </span>
        <span className="text-sm font-medium">
          {open ? "Hide the timeline" : "Show the timeline"}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-muted-foreground">
          {items.length} events
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="reel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="relative ml-4 pt-4">
              {/* The rail, drawn top-down once the panel has opened. */}
              <motion.span
                aria-hidden
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={railTransition}
                className="absolute left-0 top-0 h-full w-px origin-top bg-border"
              />

              <motion.ul
                className="divide-y divide-dashed"
                initial="hidden"
                animate="show"
                variants={{
                  show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.12 } },
                }}
              >
                {items.map((item, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: reduce ? 0 : 12 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: EASE },
                      },
                    }}
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
