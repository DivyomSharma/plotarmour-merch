"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "10%", top: "16%", width: 40, height: 1, dx: 14, dy: -12, delay: 0.1, duration: 22 },
  { left: "22%", top: "72%", width: 8, height: 8, dx: -10, dy: 12, delay: 0.7, duration: 19 },
  { left: "44%", top: "24%", width: 56, height: 1, dx: 10, dy: 10, delay: 0.4, duration: 24 },
  { left: "58%", top: "68%", width: 10, height: 10, dx: -12, dy: -14, delay: 1.1, duration: 21 },
  { left: "76%", top: "18%", width: 32, height: 1, dx: 8, dy: 12, delay: 0.9, duration: 20 },
  { left: "88%", top: "56%", width: 6, height: 6, dx: -10, dy: -8, delay: 0.5, duration: 18 },
];

export function HeroAtmosphere() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(168,58,44,0.12),transparent_24%),radial-gradient(circle_at_74%_28%,rgba(168,58,44,0.08),transparent_22%),radial-gradient(circle_at_52%_80%,rgba(244,240,232,0.05),transparent_18%)] opacity-80" />

      {particles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-foreground/10"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.width,
            height: particle.height,
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, particle.dx, 0],
                  y: [0, particle.dy, 0],
                  opacity: [0.04, 0.14, 0.04],
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute top-[18%] left-[-8%] h-px w-[52%] bg-foreground/7"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "4%", "0%"] }}
        transition={{
          duration: 24,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-[-10%] bottom-[22%] h-px w-[46%] bg-accent/14"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "-5%", "0%"] }}
        transition={{
          duration: 26,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[22%] right-[12%] h-24 w-24 rounded-full border border-foreground/8"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [0, -14, 0],
                scale: [1, 1.04, 1],
              }
        }
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
