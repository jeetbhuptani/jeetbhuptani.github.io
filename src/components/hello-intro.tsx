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

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setShow(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => setShow(false), reduce ? 900 : 2400);
    return () => clearTimeout(t);
  }, [reduce]);

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
