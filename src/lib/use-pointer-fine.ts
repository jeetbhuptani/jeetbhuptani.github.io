"use client";

import { useEffect, useState } from "react";

/**
 * True only on devices with a fine pointer (mouse/trackpad). Pointer-driven
 * effects (magnetic hover, custom cursor) gate on this so they never mount on
 * touch devices — avoids dead hover states and wasted pointermove listeners.
 */
export function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * True when the visitor has NOT requested reduced motion. Live-updates.
 */
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return allowed;
}
