"use client";

import { motion, useReducedMotion } from "framer-motion";

const keywords = [
  "PREMIUM QUALITY",
  "BULK PRICING",
  "FAST TURNAROUND",
  "NO HIDDEN FEES",
  "DIRECT SOURCING",
  "CUSTOM DESIGN",
  "TEAM MERCH",
  "STARTUP SWAG",
  "STUDENT DROPS",
];

export function MarqueeBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex select-none overflow-hidden border-b-[4px] border-foreground bg-foreground py-6 text-background transition-colors">
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 30, ease: "linear", repeat: Infinity }
        }
      >
        {[...keywords, ...keywords, ...keywords].map((word, i) => (
          <span
            key={i}
            className="flex items-center px-6 font-display text-2xl font-black uppercase tracking-widest sm:text-3xl"
            aria-hidden={i >= keywords.length ? "true" : undefined}
          >
            {word}
            <span className="mx-6 text-red-500">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
