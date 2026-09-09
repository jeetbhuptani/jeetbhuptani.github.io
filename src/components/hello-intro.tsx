"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AppleHelloEffectEnglish } from "@/components/ui/apple-hello-effect";

// Bump this key to force the intro to show again (e.g. after design changes).
const SESSION_KEY = "hello-shown-v3";

/** Speeds the handwriting up; the stock 3.5s draw is too long for an intro. */
const DURATION_SCALE = 0.7;
/** Beat between the last stroke landing and the overlay lifting. */
const HOLD_MS = 400;
/**
 * Hard ceiling on the overlay. The normal dismissal is driven by the SVG's
 * onAnimationComplete, which never fires if the tab is backgrounded mid-draw —
 * so the timer stays as the thing that guarantees the site is reachable.
 */
const MAX_MS = (0.7 + 2.8) * DURATION_SCALE * 1000 + HOLD_MS + 1200;

/**
 * Apple-"hello"-style intro. The word is drawn stroke-by-stroke as an SVG
 * pathLength animation (see `ui/apple-hello-effect.tsx`), holds a beat, then
 * the overlay lifts. Shows once per session. Reduced motion → the wordmark is
 * drawn instantly and the overlay fades, no handwriting.
 */
export function HelloIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const holdRef = useRef<ReturnType<typeof setTimeout>>();

  // Decide whether to show, exactly once.
  //
  // This deliberately does NOT depend on `reduce`. useReducedMotion() returns
  // null on the first render and resolves to a boolean immediately after, so a
  // single effect keyed on [reduce] would: show the intro and write the session
  // key, then re-run on the resolved value, clear its own timeout, hit the
  // early return because the key it just wrote is now set, and never schedule
  // the dismissal again. The overlay stayed up until a manual reload.
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);
  }, []);

  // Dismiss. Re-runs harmlessly if `reduce` resolves mid-intro, because the
  // timer is always re-armed rather than only cleared.
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), reduce ? 900 : MAX_MS);
    return () => clearTimeout(t);
  }, [show, reduce]);

  useEffect(() => () => clearTimeout(holdRef.current), []);

  // Skippable. The draw is ~3s of full-screen overlay; anyone who has seen it
  // once this month should not have to sit through it to reach the page.
  useEffect(() => {
    if (!show) return;
    const skip = () => setShow(false);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  const handleDrawn = useCallback(() => {
    holdRef.current = setTimeout(() => setShow(false), HOLD_MS);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="hello"
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
        >
          <AppleHelloEffectEnglish
            role="img"
            className="stroke-glow h-20 w-auto px-6 text-foreground sm:h-28"
            durationScale={reduce ? 0 : DURATION_SCALE}
            onAnimationComplete={handleDrawn}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
