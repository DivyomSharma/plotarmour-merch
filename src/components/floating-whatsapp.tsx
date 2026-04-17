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
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.5 }}
    >
      <Link
        href={buildWhatsAppLink(floatingMessage)}
        target="_blank"
        rel="noreferrer"
        className="brutal-panel flex items-center gap-3 bg-red-500 px-4 py-3 text-white transition-colors hover:bg-white hover:text-black"
      >
        <span className="flex h-10 w-10 items-center justify-center border-[3px] border-current text-xs font-black uppercase">
          WA
        </span>
        <span className="pr-1 text-left">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em]">
            Instant lead
          </span>
          <span className="block text-sm font-bold">WhatsApp Us</span>
        </span>
      </Link>
    </motion.div>
  );
}
