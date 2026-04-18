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
      className="fixed right-0 bottom-4 z-50 flex md:bottom-6"
      initial={shouldReduceMotion ? false : { x: "100%", opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
    >
      <Link
        href={buildWhatsAppLink(floatingMessage)}
        target="_blank"
        rel="noreferrer"
        className="brutal-panel group flex items-center gap-3 bg-red-500 py-3 pr-6 pl-3 text-white transition-all duration-300 ease-out hover:-translate-x-4 hover:bg-white hover:text-black translate-x-[calc(100%-72px)]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-current text-xl font-black transition-transform duration-300 group-hover:rotate-180">
          ←
        </span>
        <span className="whitespace-nowrap text-left opacity-100">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em]">
            Instant lead
          </span>
          <span className="block text-sm font-bold">WhatsApp Us</span>
        </span>
      </Link>
    </motion.div>
  );
}
