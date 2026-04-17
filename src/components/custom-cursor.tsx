"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
    const allowMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsFinePointer || !allowMotion) {
      document.documentElement.removeAttribute("data-cursor");
      return;
    }

    document.documentElement.dataset.cursor = "custom";

    const dot = dotRef.current;
    const halo = haloRef.current;

    if (!dot || !halo) {
      return;
    }

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let haloX = pointerX;
    let haloY = pointerY;
    let frameId = 0;

    const render = () => {
      haloX += (pointerX - haloX) * 0.16;
      haloY += (pointerY - haloY) * 0.16;

      dot.style.transform = `translate3d(${pointerX - 4}px, ${pointerY - 4}px, 0)`;
      halo.style.transform = `translate3d(${haloX - 15}px, ${haloY - 15}px, 0)`;
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const setActiveState = (active: boolean) => {
      halo.style.scale = active ? "1.45" : "1";
      halo.style.opacity = active ? "0.95" : "1";
      dot.style.scale = active ? "1.2" : "1";
    };

    const handleHover = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest("a, button, input, textarea, select, label"),
      );
      setActiveState(isInteractive);
    };

    const handlePointerDown = () => setActiveState(true);
    const handlePointerUp = () => setActiveState(false);

    frameId = window.requestAnimationFrame(render);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerover", handleHover, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handleHover);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeAttribute("data-cursor");
    };
  }, []);

  return (
    <>
      <div ref={haloRef} aria-hidden="true" className="custom-cursor-halo hidden md:block" />
      <div ref={dotRef} aria-hidden="true" className="custom-cursor-dot hidden md:block" />
    </>
  );
}
