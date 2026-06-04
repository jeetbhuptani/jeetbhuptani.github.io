"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Small thematic micro-animation used as the "media" for the Ignosis showcase
 * cards (U10) — no screenshots/video, capability-level only. "voice" = pulsing
 * call rings + waveform; "collections" = multi-channel lines with traveling
 * payloads. Both fall back to a static frame under reduced motion.
 */
export function ShowcaseMotif({ variant }: { variant: "collections" | "voice" }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-gradient-to-br from-secondary/50 to-card">
      <div className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(hsl(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
      {variant === "voice" ? (
        <VoiceMotif reduce={!!reduce} />
      ) : (
        <CollectionsMotif reduce={!!reduce} />
      )}
    </div>
  );
}

function VoiceMotif({ reduce }: { reduce: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-7 rounded-full border border-brand/50"
          animate={reduce ? { scale: 1.6, opacity: 0.15 } : { scale: [1, 3.4], opacity: [0.6, 0] }}
          transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      <span className="relative z-10 size-3 rounded-full bg-brand" />
      <div className="absolute bottom-4 flex items-end gap-1">
        {[6, 12, 8, 16, 9, 13, 7].map((h, i) => (
          <motion.span
            key={i}
            className="w-1 rounded-full bg-brand/60"
            style={{ height: h }}
            animate={reduce ? {} : { scaleY: [0.5, 1.4, 0.7] }}
            transition={reduce ? undefined : { duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionsMotif({ reduce }: { reduce: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-5 px-8">
      {[0, 1, 2].map((row) => (
        <div key={row} className="relative h-px w-full bg-border">
          <span className="absolute -left-1 -top-[3px] size-1.5 rounded-full bg-muted-foreground/50" />
          <span className="absolute -right-1 -top-[3px] size-1.5 rounded-full bg-muted-foreground/50" />
          <motion.span
            className="absolute -top-[3px] size-1.5 rounded-full bg-brand shadow-[0_0_8px_hsl(var(--brand))]"
            animate={reduce ? { left: "50%" } : { left: ["-2%", "102%"] }}
            transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, delay: row * 0.5, ease: "linear" }}
          />
        </div>
      ))}
    </div>
  );
}
