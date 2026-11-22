"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 md:px-6">
      <section className="surface-card w-full rounded-[30px] p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">Something went wrong</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl">
          We could not load that page.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-text-soft">
          Your quote request has not been sent from this error screen. Try again, browse the catalogue, or start a new request.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white">
            Try again
          </button>
          <Link href="/" className="rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-foreground">
            Browse catalogue
          </Link>
          <Link href="/order" className="rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-foreground">
            Request a quote
          </Link>
        </div>
      </section>
    </main>
  );
}
