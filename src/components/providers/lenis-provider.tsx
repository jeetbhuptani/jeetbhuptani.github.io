"use client";

import { ReactLenis } from "lenis/react";
import { useMotionAllowed } from "@/lib/use-pointer-fine";

/**
 * Smooth-scroll layer. Disabled entirely under prefers-reduced-motion (smooth
 * scroll is itself motion) — those visitors get native scrolling. Mounted at the
 * root so the whole document shares one Lenis instance.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const allowed = useMotionAllowed();

  if (!allowed) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
