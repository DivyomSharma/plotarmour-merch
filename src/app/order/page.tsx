import { LeadForm } from "@/components/lead-form";
import { OrderFaq } from "@/components/order-faq";
import { WorkspaceShell } from "@/components/workspace-shell";
import { orderSteps } from "@/lib/order-steps";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    kit?: string | string[];
    headcount?: string | string[];
    budget?: string | string[];
  }>;
}) {
  const { kit, headcount, budget } = await searchParams;
  const defaultProduct = typeof kit === "string" ? kit.slice(0, 80) : "";
  const sanitiseNumber = (value: string | string[] | undefined) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!/^\d{1,9}$/.test(trimmed)) return "";
    return String(Number.parseInt(trimmed, 10));
  };

  return (
    <WorkspaceShell
      eyebrow="Request a quote"
      title="Tell us what you need. We will quote it properly."
      description="Send a short enquiry with the product or kit, the quantity and the date you need it by. We review it and reply with a quote. Nothing is charged on this page."
    >
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <section className="space-y-6">
          <div className="surface-card rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
              What happens next
            </p>
            <ol className="mt-5 space-y-4">
              {orderSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] text-xs text-text-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-6 text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <OrderFaq />
        </section>

        <LeadForm
          defaultProduct={defaultProduct}
          defaultHeadcount={sanitiseNumber(headcount)}
          defaultBudget={sanitiseNumber(budget)}
        />
      </main>
    </WorkspaceShell>
  );
}
