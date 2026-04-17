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
      className="inline-flex h-12 w-12 items-center justify-center border-[4px] border-foreground bg-background text-foreground transition-colors duration-200 hover:bg-red-500 hover:text-white"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -24, scale: 0.75, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none" aria-hidden="true">
      <path
        d="M18.5 14.5A7 7 0 0 1 9.5 5.5 8 8 0 1 0 18.5 14.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
