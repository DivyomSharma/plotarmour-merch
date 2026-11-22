import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 md:px-6">
      <section className="surface-card w-full rounded-[30px] p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">404 · Not found</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl">
          This page is not in the catalogue.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-text-soft">
          The link may be out of date, or the item is no longer available to browse. Explore the current catalogue or send us a bulk brief.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold text-foreground">
            Browse catalogue
          </Link>
          <Link href="/order" className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white">
            Request a quote
          </Link>
        </div>
      </section>
    </main>
  );
}
