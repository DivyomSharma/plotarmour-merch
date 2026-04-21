"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, ReactNode } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  href: string;
  className?: string;
  invert?: boolean;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

export function MagneticButton({
  children,
  href,
  className = "",
  invert = false,
  target,
  rel,
}: MagneticButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="inline-flex"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        target={target}
        rel={rel}
        className={`inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-all duration-300 md:px-6 ${
          invert
            ? "border-[color:var(--border-strong)] bg-transparent text-foreground hover:border-accent hover:bg-accent/8"
            : "border-accent bg-accent text-white hover:bg-accent-strong hover:shadow-[0_12px_30px_rgba(168,58,44,0.22)]"
        } ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
