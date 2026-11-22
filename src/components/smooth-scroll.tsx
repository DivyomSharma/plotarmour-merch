"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let lenis: Lenis | undefined;
    let frameId = 0;

    const stop = () => {
      window.cancelAnimationFrame(frameId);
      lenis?.destroy();
      lenis = undefined;
    };

    const start = () => {
      stop();
      if (reducedMotion.matches || !finePointer.matches) return;

      lenis = new Lenis({
      duration: 1.85,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = window.requestAnimationFrame(raf);
      };

      frameId = window.requestAnimationFrame(raf);
    };

    start();
    reducedMotion.addEventListener("change", start);
    finePointer.addEventListener("change", start);

    return () => {
      reducedMotion.removeEventListener("change", start);
      finePointer.removeEventListener("change", start);
      stop();
    };
  }, []);

  return null;
}
