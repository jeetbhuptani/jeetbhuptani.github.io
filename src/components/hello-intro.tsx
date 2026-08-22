"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Bump this key to force the intro to show again (e.g. after design changes).
const SESSION_KEY = "hello-shown-v2";

/**
 * Apple-"hello"-style intro (chanhdai-inspired). A cursive "hello" writes itself
 * in with a left-to-right reveal + an underline stroke, holds, then the overlay
 * lifts to reveal the site. Shows once per session. Reduced motion → a quick
 * fade, no wipe.
 */
export function HelloIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

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
    const t = setTimeout(() => setShow(false), reduce ? 900 : 2400);
    return () => clearTimeout(t);
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="hello"
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
        >
          <div className="flex flex-col items-center">
            <motion.span
              className="text-glow select-none font-serif text-7xl italic leading-none text-foreground sm:text-9xl"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: reduce ? 0.4 : 1.4, ease: [0.6, 0.05, 0.3, 1] }}
            >
              hello
            </motion.span>
            <motion.span
              aria-hidden
              className="mt-3 h-px bg-foreground/60"
              initial={{ width: 0 }}
              animate={{ width: reduce ? "60%" : "70%" }}
              transition={{ duration: reduce ? 0.4 : 1, delay: reduce ? 0 : 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
