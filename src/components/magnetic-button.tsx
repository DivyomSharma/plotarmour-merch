"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, MouseEvent, ReactNode, useState } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  href: string;
  className?: string;
  invert?: boolean;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

type PointerOffset = {
  x: number;
  y: number;
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
  const [offset, setOffset] = useState<PointerOffset>({ x: 0, y: 0 });

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldReduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
    setOffset({ x, y });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : offset}
      transition={{ type: "spring", stiffness: 280, damping: 18, mass: 0.2 }}
      className="inline-flex"
    >
      <Link
        href={href}
        target={target}
        rel={rel}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onBlur={reset}
        className={`group relative inline-flex min-h-14 items-center justify-center border-[4px] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition-colors duration-200 md:px-7 ${
          invert
            ? "border-white bg-white text-black hover:bg-red-500 hover:text-white"
            : "border-white bg-red-500 text-white hover:bg-white hover:text-black"
        } ${className}`}
      >
        <motion.span
          className="absolute inset-0 border-[2px] border-black/80"
          aria-hidden="true"
          initial={false}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -2, 2, 0],
                  y: [0, 1, -1, 0],
                }
          }
          transition={{ duration: 0.28 }}
        />
        <motion.span
          className="relative z-10"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
        >
          {children}
        </motion.span>
      </Link>
    </motion.div>
  );
}
