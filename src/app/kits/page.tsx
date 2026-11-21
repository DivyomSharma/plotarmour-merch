import Link from "next/link";
import type { Metadata } from "next";
import { KitImage } from "@/components/kit-image";
import { WorkspaceShell } from "@/components/workspace-shell";
import { kits } from "@/lib/kits";

export const metadata: Metadata = {
  title: "Merchandise kits",
  description:
    "Start a bulk merchandise brief from a curated employee, event, campus, or gifting kit.",
};

export default function KitsPage() {
  return (
    <WorkspaceShell
      eyebrow="Curated merchandise kits"
      title="Start with a real use case, then tailor the quote."
      description="Each kit is a planning starting point. Contents and placeholder indicative budgets are confirmed only in your quote."
      titleClassName="leading-[0.98] tracking-[-0.06em]"
    >
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {kits.map((kit, index) => (
            <Link
              key={kit.slug}
              href={`/kits/${kit.slug}`}
              className="surface-card group flex min-w-0 flex-col overflow-hidden rounded-[30px] transition-colors hover:border-[color:var(--border-strong)]"
            >
              <KitImage kit={kit} priority={index < 2} />
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {kit.audience}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  {kit.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-text-soft">
                  {kit.summary}
                </p>
                <p className="mt-5 text-sm font-semibold text-foreground">
                  Explore kit <span aria-hidden="true">→</span>
                </p>
              </div>
            </Link>
          ))}
          <Link
            href="/order?kit=Custom%20kit"
            className="surface-card group flex min-w-0 flex-col overflow-hidden rounded-[30px] transition-colors hover:border-[color:var(--border-strong)]"
          >
            <div className="relative flex aspect-[4/3] items-end overflow-hidden bg-[radial-gradient(circle_at_top_right,_color-mix(in_srgb,var(--accent)_42%,transparent),_transparent_45%),linear-gradient(135deg,var(--surface-elevated),var(--surface))] p-5 md:p-6">
              <p className="font-display text-[2rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[2.4rem]">
                Your brief,<br />
                built to fit.
              </p>
            </div>
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Flexible starting point
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Build your own kit
              </h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-text-soft">
                Start from a headcount and a per-head budget, and we will propose the mix.
              </p>
              <p className="mt-5 text-sm font-semibold text-foreground">
                Start a custom brief <span aria-hidden="true">→</span>
              </p>
            </div>
          </Link>
        </div>
      </main>
    </WorkspaceShell>
  );
}
