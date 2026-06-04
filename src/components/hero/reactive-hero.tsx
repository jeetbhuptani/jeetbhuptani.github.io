"use client";

import { useEffect, useRef } from "react";
import { usePointerFine, useMotionAllowed } from "@/lib/use-pointer-fine";
import { cn } from "@/lib/utils";

/**
 * Cursor-reactive dot grid — the signature hero visual. Dots near the pointer
 * grow and tint toward the brand accent; elsewhere they sit as a faint grid.
 * Draws are rAF-coalesced (no continuous loop) so it's cheap. On touch / reduced
 * motion it renders a single static grid and attaches no pointer listeners
 * (R5/R6/AE1/AE2). Colors read live from CSS vars so it follows the theme.
 */
export function ReactiveHero({ className }: { className?: string }) {
  const fine = usePointerFine();
  const allowed = useMotionAllowed();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 26;
    const INFLUENCE = 130;
    const pointer = { x: -9999, y: -9999, active: false };
    let w = 0;
    let h = 0;
    let frame = 0;

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      return {
        fg: s.getPropertyValue("--foreground").trim(),
        brand: s.getPropertyValue("--brand").trim(),
      };
    };
    let colors = readColors();

    const draw = () => {
      frame = 0;
      ctx.clearRect(0, 0, w, h);
      for (let x = GAP / 2; x < w; x += GAP) {
        for (let y = GAP / 2; y < h; y += GAP) {
          let r = 1;
          let alpha = 0.16;
          let brand = false;
          if (pointer.active) {
            const dist = Math.hypot(x - pointer.x, y - pointer.y);
            if (dist < INFLUENCE) {
              const t = 1 - dist / INFLUENCE;
              r = 1 + t * 2.4;
              alpha = 0.16 + t * 0.65;
              brand = t > 0.55;
            }
          }
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${brand ? colors.brand : colors.fg} / ${alpha})`;
          ctx.fill();
        }
      }
    };

    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestDraw();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      pointer.active = px >= 0 && px <= w && py >= 0 && py <= h;
      pointer.x = px;
      pointer.y = py;
      requestDraw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      requestDraw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    resize();
    const interactive = fine && allowed;
    if (interactive) window.addEventListener("pointermove", onMove);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [fine, allowed]);

  return <canvas ref={canvasRef} aria-hidden className={cn("h-full w-full", className)} />;
}
