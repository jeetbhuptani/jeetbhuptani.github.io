"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePointerFine, useMotionAllowed } from "@/lib/use-pointer-fine";

gsap.registerPlugin(useGSAP);

/**
 * Signature custom cursor: an instant brand dot trailed by a lagging ring that
 * grows over interactive elements ([data-cursor], a, button). Only mounts on
 * fine pointers with motion allowed (R5/R6/AE2); useGSAP auto-reverts on unmount
 * so route changes leave no orphaned listeners (StrictMode-safe).
 */
export function MagneticCursor() {
  const fine = usePointerFine();
  const allowed = useMotionAllowed();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!fine || !allowed) return;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;

      document.documentElement.classList.add("has-custom-cursor");

      const xDot = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
      const yDot = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
      const xRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
      const yRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

      const move = (e: PointerEvent) => {
        xDot(e.clientX);
        yDot(e.clientY);
        xRing(e.clientX);
        yRing(e.clientY);
      };

      const enter = () => gsap.to(ring, { scale: 1.9, opacity: 0.5, duration: 0.3, ease: "power3" });
      const leave = () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power3" });

      const interactive = Array.from(
        document.querySelectorAll<HTMLElement>("a, button, [data-cursor]")
      );
      interactive.forEach((el) => {
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
      });
      window.addEventListener("pointermove", move);

      return () => {
        window.removeEventListener("pointermove", move);
        interactive.forEach((el) => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
        });
        document.documentElement.classList.remove("has-custom-cursor");
      };
    },
    { dependencies: [fine, allowed] }
  );

  if (!fine || !allowed) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] -ml-4 -mt-4 h-8 w-8 rounded-full border border-brand/70 mix-blend-difference"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] -ml-1 -mt-1 h-2 w-2 rounded-full bg-brand"
      />
    </>
  );
}
