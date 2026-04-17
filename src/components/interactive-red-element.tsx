"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, MotionValue } from "framer-motion";
import { useEffect } from "react";

export function InteractiveRedElement({ y }: { y: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-500, 500], [25, -25]);
  const rotateY = useTransform(springX, [-500, 500], [-25, 25]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className="absolute right-10 top-12 hidden h-32 w-32 border-[4px] border-foreground bg-red-500 lg:block shadow-[12px_12px_0px_0px_var(--tw-shadow-color)] shadow-foreground" aria-hidden="true" />
    );
  }

  return (
    <motion.div 
      className="absolute right-[12%] top-28 hidden lg:flex items-center justify-center p-12 z-20 pointer-events-none" 
      style={{ y, perspective: 1200 }} 
      aria-hidden="true"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-32 w-40"
      >
        {/* Shadow Layer (shifted back) */}
        <div 
          className="absolute inset-0 bg-foreground" 
          style={{ transform: "translateZ(-20px) translateX(16px) translateY(16px)" }}
        />
        {/* Main Red Box */}
        <div 
          className="absolute inset-0 border-[4px] border-foreground bg-red-500" 
          style={{ transform: "translateZ(0px)" }}
        />
        {/* Floating Detail layer (shifted front) */}
        <div 
          className="absolute -right-8 -top-8 h-16 w-16 border-[4px] border-foreground bg-background" 
          style={{ transform: "translateZ(40px)" }}
        />
        {/* Second detail */}
        <div 
          className="absolute -bottom-6 -left-6 h-8 w-8 rounded-full border-[3px] border-foreground bg-foreground" 
          style={{ transform: "translateZ(60px)" }}
        />
      </motion.div>
    </motion.div>
  );
}
