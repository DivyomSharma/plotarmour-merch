"use client";

import { motion } from "framer-motion";
import { startTransition, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "plotarmour-theme";

function resolveTheme(): Theme {
  const currentTheme = document.documentElement.dataset.theme;

  if (currentTheme === "light" || currentTheme === "dark") {
    return currentTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "dark" : resolveTheme(),
  );

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    startTransition(() => setTheme(nextTheme));
  };

  const isLight = theme === "light";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={{ scale: 0.96 }}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-surface/80 text-foreground transition-colors duration-300 hover:border-accent hover:text-accent"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -16, scale: 0.82, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="block"
      >
        {isLight ? <MoonIcon /> : <SunIcon />}
      </motion.span>
    </motion.button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.1" />
      <path
        d="M12 2.5v2.8M12 18.7v2.8M4.93 4.93l1.98 1.98M17.09 17.09l1.98 1.98M2.5 12h2.8M18.7 12h2.8M4.93 19.07l1.98-1.98M17.09 6.91l1.98-1.98"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none" aria-hidden="true">
      <path
        d="M18.4 14.4A7.2 7.2 0 0 1 9.6 5.6a8 8 0 1 0 8.8 8.8Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
