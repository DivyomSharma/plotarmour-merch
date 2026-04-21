"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "8%", top: "14%", width: 34, height: 1, dx: 14, dy: -12, delay: 0.1, duration: 22 },
  { left: "18%", top: "68%", width: 8, height: 8, dx: -10, dy: 12, delay: 0.7, duration: 19 },
  { left: "34%", top: "22%", width: 48, height: 1, dx: 10, dy: 10, delay: 0.4, duration: 24 },
  { left: "28%", top: "82%", width: 28, height: 1, dx: 8, dy: 12, delay: 0.9, duration: 20 },
  { left: "42%", top: "58%", width: 6, height: 6, dx: -10, dy: -8, delay: 0.5, duration: 18 },
];

export function HeroAtmosphere() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(168,58,44,0.16),transparent_26%),radial-gradient(circle_at_40%_58%,rgba(244,240,232,0.06),transparent_20%)] opacity-80" />

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
        className="absolute top-[20%] left-[-6%] h-px w-[24%] bg-foreground/7"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "4%", "0%"] }}
        transition={{
          duration: 24,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-[12%] bottom-[20%] h-px w-[22%] bg-accent/14"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "-5%", "0%"] }}
        transition={{
          duration: 26,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
