"use client";

import { useEffect } from "react";
import { usePointerFine, useMotionAllowed } from "@/lib/use-pointer-fine";

/**
 * Global click-ripple (R28, evilrabbit-style): a pointer-down scatters a few
 * short-lived dots from the click point. Pointer-fine + motion-allowed only, so
 * it never fires on touch or under reduced motion. Dots clean themselves up.
 */
export function ClickRipple() {
  const fine = usePointerFine();
  const allowed = useMotionAllowed();

  useEffect(() => {
    if (!fine || !allowed) return;
    const onDown = (e: PointerEvent) => {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const dot = document.createElement("span");
        const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const dist = 14 + Math.random() * 12;
        dot.className = "click-ripple-dot";
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        dot.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        dot.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
        dot.addEventListener("animationend", () => dot.remove());
        document.body.appendChild(dot);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [fine, allowed]);

  return null;
}
