import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitBudgetTool } from "@/components/kit-budget-tool";
import { KitImage } from "@/components/kit-image";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getKitBySlug, kits } from "@/lib/kits";

export function generateStaticParams() {
  return kits.map((kit) => ({ slug: kit.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = getKitBySlug(slug);
  if (!kit) return {};
  return { title: kit.name, description: kit.summary };
}

export default async function KitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kit = getKitBySlug(slug);
  if (!kit) notFound();

  return (
    <WorkspaceShell
      eyebrow="Curated merchandise kit"
      title={kit.name}
      description={kit.summary}
      titleClassName="leading-[0.98] tracking-[-0.06em]"
    >
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section
            className="overflow-hidden rounded-[30px] border fine-rule bg-surface"
            aria-label={`${kit.name} overview`}
          >
            <KitImage kit={kit} priority />
            <div className="p-5 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                For {kit.audience}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                What is inside
              </h2>
              <ul className="mt-5 divide-y fine-rule">
                {kit.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="text-foreground">{item.name}</span>
                    <span className="shrink-0 text-text-soft">
                      {item.quantityPerHead} per head · {item.category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <div className="space-y-6">
            <section className="surface-card rounded-[30px] p-5 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Indicative planning range
              </p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
                ₹{kit.indicativePerHeadBudget.min.toLocaleString("en-IN")}–₹
                {kit.indicativePerHeadBudget.max.toLocaleString("en-IN")}{" "}
                <span className="text-base text-text-soft">per head</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-text-soft">
                Indicative per head only. Final products, customisation, GST,
                and delivery are confirmed in quote.
              </p>
            </section>
            <section className="surface-card rounded-[30px] p-5 md:p-7">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Customisation
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {kit.customisationOptions.map((option) => (
                  <li
                    key={option}
                    className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-text-soft"
                  >
                    {option}
                  </li>
                ))}
              </ul>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Lead-time band
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-soft">
                {kit.leadTimeBand}
              </p>
            </section>
            <KitBudgetTool kit={kit} />
          </div>
        </div>
        <Link
          href="/kits"
          className="mt-10 inline-flex text-sm font-semibold text-foreground underline decoration-[color:var(--border-strong)] underline-offset-4"
        >
          View all kits
        </Link>
      </main>
    </WorkspaceShell>
  );
}
