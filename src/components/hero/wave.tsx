"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Signature waving hand (R27, chanhdai-style). Loops gently and replays a
 * fuller wave on hover. Static under reduced motion.
 */
export function Wave() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      role="img"
      aria-label="waving hand"
      className="inline-block origin-[70%_75%] [will-change:transform]"
      animate={reduce ? undefined : { rotate: [0, 16, -6, 16, -3, 0] }}
      transition={
        reduce
          ? undefined
          : { duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }
      }
      whileHover={reduce ? undefined : { rotate: [0, 18, -8, 18, 0], transition: { duration: 0.7 } }}
    >
      👋
    </motion.span>
  );
}
