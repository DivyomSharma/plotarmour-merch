"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

type TypeHeadlineProps = {
  text: string;
  className?: string;
};

export function TypeHeadline({ text, className = "" }: TypeHeadlineProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const displayText = useMemo(
    () => text.slice(0, visibleCount),
    [text, visibleCount],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const revealId = window.setTimeout(() => setVisibleCount(text.length), 0);

      return () => window.clearTimeout(revealId);
    }

    if (text.length === 0) {
      return;
    }

    let currentIndex = 0;
    let timeoutId = 0;

    const tick = () => {
      currentIndex = Math.min(text.length, currentIndex + 1);
      startTransition(() => setVisibleCount(currentIndex));

      if (currentIndex < text.length) {
        const pause = text[currentIndex - 1] === "\n" ? 170 : 34;
        timeoutId = window.setTimeout(tick, pause);
      }
    };

    timeoutId = window.setTimeout(tick, 180);

    return () => window.clearTimeout(timeoutId);
  }, [text]);

  return (
    <span className={`relative inline-block whitespace-pre-wrap ${className}`}>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span className="absolute inset-0 whitespace-pre-wrap">
        {displayText}
        <span
          className="type-caret h-[0.92em]"
          style={{ opacity: visibleCount >= text.length ? 0.42 : 1 }}
        />
      </span>
    </span>
  );
}
