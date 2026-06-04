"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Apple-"hello"-style intro (chanhdai-inspired). A cursive "hello" writes itself
 * in with a left-to-right reveal, holds, then the overlay lifts to reveal the
 * site. Shows once per session. Reduced motion → a quick fade, no wipe.
 */
export function HelloIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("hello-shown")) {
      setShow(false);
      return;
    }
    sessionStorage.setItem("hello-shown", "1");
    const t = setTimeout(() => setShow(false), reduce ? 800 : 2000);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <motion.span
            className="text-glow select-none font-serif text-6xl italic leading-none text-foreground sm:text-8xl"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: reduce ? 0.4 : 1.3, ease: [0.6, 0.05, 0.3, 1] }}
          >
            hello
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
