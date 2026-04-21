"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/contact";

const floatingMessage =
  "Hi PlotArmour Merch, we need a quote for bulk merch / gifting.";

export function FloatingWhatsApp() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6"
      initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
    >
      <Link
        href={buildWhatsAppLink(floatingMessage)}
        target="_blank"
        rel="noreferrer"
        className="surface-panel flex items-center gap-3 rounded-full px-3 py-3 text-foreground transition-all duration-300 hover:border-accent"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          WA
        </span>
        <span className="pr-1 text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-soft">
            WhatsApp
          </span>
          <span className="block text-sm font-semibold">Get a quick quote</span>
        </span>
      </Link>
    </motion.div>
  );
}
