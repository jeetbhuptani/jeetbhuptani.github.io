"use client";

import { useEffect, useRef } from "react";

import { useMotionAllowed, usePointerFine } from "@/lib/use-pointer-fine";

/**
 * Custom cursor: an instant dot trailed by a lagging ring that grows over
 * interactive elements. Only mounts on fine pointers with motion allowed.
 *
 * Implemented as a single rAF lerp rather than with GSAP — this is the only
 * thing that pulled GSAP into the bundle, and ~70KB of tween engine to move two
 * divs is not a trade worth making. The loop parks itself when the pointer is
 * at rest, so it costs nothing while reading.
 *
 * Hover targets are matched by event delegation on the document, so elements
 * rendered after mount (the client-fetched bookshelf, admin editors, anything
 * behind a route change) get the effect too. The previous querySelectorAll-once
 * approach silently missed all of them.
 */

/** Per-frame approach factor. Higher = snappier; the ring lags deliberately. */
const DOT_EASE = 0.35;
const RING_EASE = 0.14;
/** Below this, we are within a pixel of the target — stop the loop. */
const REST_EPSILON = 0.05;

export function MagneticCursor() {
  const fine = usePointerFine();
  const allowed = useMotionAllowed();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine || !allowed) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let dotX = targetX;
    let dotY = targetY;
    let ringX = targetX;
    let ringY = targetY;
    let ringScale = 1;
    let targetScale = 1;
    let frame = 0;

    const tick = () => {
      dotX += (targetX - dotX) * DOT_EASE;
      dotY += (targetY - dotY) * DOT_EASE;
      ringX += (targetX - ringX) * RING_EASE;
      ringY += (targetY - ringY) * RING_EASE;
      ringScale += (targetScale - ringScale) * RING_EASE;

      // translate3d keeps both elements on their own compositor layer, so the
      // cursor never invalidates layout or paint for the rest of the page.
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${ringScale})`;
      ring.style.opacity = String(1 - (ringScale - 1) * 0.55);

      const settled =
        Math.abs(targetX - ringX) < REST_EPSILON &&
        Math.abs(targetY - ringY) < REST_EPSILON &&
        Math.abs(targetScale - ringScale) < REST_EPSILON;

      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      wake();
    };

    const INTERACTIVE = "a, button, [data-cursor], input, textarea, select, summary";
    const onOver = (e: PointerEvent) => {
      const next = (e.target as Element | null)?.closest?.(INTERACTIVE) ? 1.9 : 1;
      if (next !== targetScale) {
        targetScale = next;
        wake();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    // pointerover bubbles, so one listener covers the whole document.
    document.addEventListener("pointerover", onOver, { passive: true });
    wake();

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("has-custom-cursor");
    };
  }, [fine, allowed]);

  if (!fine || !allowed) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] -ml-4 -mt-4 h-8 w-8 rounded-full border border-brand/70 mix-blend-difference will-change-transform"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] -ml-1 -mt-1 h-2 w-2 rounded-full bg-brand will-change-transform"
      />
    </>
  );
}
