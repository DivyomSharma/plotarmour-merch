import { LeadForm } from "@/components/lead-form";
import { WorkspaceShell } from "@/components/workspace-shell";
import { projectStages } from "@/lib/merch-data";

export default function OrderPage() {
  return (
    <WorkspaceShell
      eyebrow="PlotArmour order intake"
      title="A clean lead intake, then a managed merchandise project."
      description="This route replaces any checkout pattern. The customer creates a lead with a short form, then the internal team moves the requirement through discussion, quotation, approvals, payments, production, and dispatch."
    >
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <section className="space-y-6">
          <div className="surface-card rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
              Customer flow
            </p>
            <div className="mt-5 space-y-3">
              {projectStages.map((stage, index) => (
                <div key={stage} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] text-xs text-text-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{stage}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
              Design direction
            </p>
            <p className="mt-4 text-sm leading-7 text-text-soft">
              The workspace stays black-and-white, document-like, and operational.
              No ecommerce cards, no cart metaphors, and no consumer checkout language.
            </p>
          </div>
        </section>

        <LeadForm />
      </main>
    </WorkspaceShell>
  );
}
