"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, MotionValue } from "framer-motion";
import { useEffect } from "react";

import Image from "next/image";

export function InteractiveRedElement({ y }: { y: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-500, 500], [15, -15]);
  const rotateY = useTransform(springX, [-500, 500], [-15, 15]);

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

  if (shouldReduceMotion) return null;

  return (
    <motion.div 
      className="absolute right-[5%] top-12 hidden lg:flex items-center justify-center p-12 z-0 pointer-events-none w-[500px] h-[400px]" 
      style={{ y, perspective: 1200 }} 
      aria-hidden="true"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        <div className="absolute top-[10%] left-[5%] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-foreground border-[3px] border-foreground bg-white" style={{ transform: "translateZ(20px) rotate(-8deg)" }}>
          <Image src="/products/hoodie.png" alt="" width={140} height={140} className="object-cover w-[140px] h-[140px] grayscale" />
        </div>
        <div className="absolute top-[45%] left-[30%] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-foreground border-[3px] border-foreground bg-white z-10" style={{ transform: "translateZ(80px) rotate(4deg)" }}>
          <Image src="/products/varsity.png" alt="" width={160} height={160} className="object-cover w-[160px] h-[160px]" />
        </div>
        <div className="absolute top-[5%] right-[15%] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-foreground border-[3px] border-foreground bg-white" style={{ transform: "translateZ(40px) rotate(12deg)" }}>
          <Image src="/products/cap.png" alt="" width={110} height={110} className="object-cover w-[110px] h-[110px] grayscale" />
        </div>
        <div className="absolute bottom-[5%] right-[5%] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-foreground border-[3px] border-foreground bg-white" style={{ transform: "translateZ(60px) rotate(-10deg)" }}>
          <Image src="/products/tshirt.png" alt="" width={130} height={130} className="object-cover w-[130px] h-[130px]" />
        </div>
        <div className="absolute bottom-[10%] left-[0%] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-foreground border-[3px] border-foreground bg-white z-20" style={{ transform: "translateZ(100px) rotate(6deg)" }}>
          <Image src="/products/bottle.png" alt="" width={90} height={90} className="object-cover w-[90px] h-[90px] grayscale" />
        </div>
      </motion.div>
    </motion.div>
  );
}
