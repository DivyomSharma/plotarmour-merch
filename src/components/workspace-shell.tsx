import Link from "next/link";
import { ReactNode } from "react";

export function WorkspaceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b fine-rule">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[2.6rem] font-semibold tracking-[-0.06em] md:text-[4.4rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-soft md:text-base">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-text-soft transition-colors hover:text-foreground"
            >
              Landing
            </Link>
            <Link
              href="/order"
              className="rounded-full border border-accent bg-accent px-4 py-2 font-semibold text-white"
            >
              Order Now
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-text-soft transition-colors hover:text-foreground"
            >
              Owner Dashboard
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
