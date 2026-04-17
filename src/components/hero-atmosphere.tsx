"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "5%", top: "14%", width: 6, height: 6, dx: 18, dy: -22, delay: 0.1, duration: 14 },
  { left: "14%", top: "68%", width: 44, height: 2, dx: 22, dy: -14, delay: 0.6, duration: 17 },
  { left: "27%", top: "22%", width: 10, height: 10, dx: -18, dy: 20, delay: 0.3, duration: 13 },
  { left: "38%", top: "56%", width: 58, height: 2, dx: 16, dy: 18, delay: 1.2, duration: 19 },
  { left: "48%", top: "18%", width: 14, height: 14, dx: 14, dy: -16, delay: 0.8, duration: 16 },
  { left: "58%", top: "74%", width: 8, height: 8, dx: -14, dy: -18, delay: 0.2, duration: 15 },
  { left: "69%", top: "36%", width: 64, height: 2, dx: -18, dy: 24, delay: 0.9, duration: 18 },
  { left: "78%", top: "15%", width: 12, height: 12, dx: 16, dy: 18, delay: 0.4, duration: 14 },
  { left: "87%", top: "63%", width: 36, height: 2, dx: -16, dy: -12, delay: 1.1, duration: 16 },
  { left: "92%", top: "28%", width: 7, height: 7, dx: -12, dy: 16, delay: 0.7, duration: 15 },
];

export function HeroAtmosphere() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,35,35,0.16),transparent_26%),radial-gradient(circle_at_76%_32%,rgba(255,35,35,0.10),transparent_22%),radial-gradient(circle_at_54%_78%,rgba(255,255,255,0.08),transparent_20%)] opacity-70" />

      {particles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute border border-foreground/18 bg-foreground/10"
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
                  opacity: [0.08, 0.2, 0.08],
                  rotate: [0, particle.dx > 0 ? 8 : -8, 0],
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
        className="absolute top-[18%] left-[-8%] h-px w-[52%] bg-foreground/10"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "4%", "0%"] }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-[-10%] bottom-[22%] h-px w-[46%] bg-accent/18"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "-5%", "0%"] }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[26%] right-[12%] h-28 w-28 border border-foreground/12"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: [0, 12, 0],
                y: [0, -18, 0],
              }
        }
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
