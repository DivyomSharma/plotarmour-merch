"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  /**
   * Above-the-fold content: stays fully visible in the server HTML (opacity never 0, no blur)
   * and only slides up on hydration, so LCP does not wait for JavaScript.
   */
  eager?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.2,
  eager = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (eager) {
    return (
      <motion.div
        className={className}
        initial={shouldReduceMotion ? false : { y: 18 }}
        animate={shouldReduceMotion ? undefined : { y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      // Hidden-until-revealed styles are inlined by the server render; the layout's <noscript>
      // rule targets [data-reveal] so content stays visible when JavaScript is unavailable.
      data-reveal=""
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={
        shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
