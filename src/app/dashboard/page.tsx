import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { dashboardBuckets, mockProjects } from "@/lib/merch-data";

const statusLabels = {
  new: "New Lead",
  open: "Open",
  quotation_pending: "Quotation Pending",
  payment_pending: "Payment Pending",
  production_running: "Production Running",
  dispatch_pending: "Dispatch Pending",
  completed: "Completed",
  archived: "Archived",
};

export default function DashboardPage() {
  return (
    <WorkspaceShell
      eyebrow="Owner dashboard"
      title="Internal CRM for structured merchandise execution."
      description="Leads arrive from the landing page, move into discussion, then become project workspaces with quotes, payment checkpoints, production handoff, and dispatch history."
    >
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardBuckets.map((bucket) => (
            <div key={bucket.label} className="surface-card rounded-[28px] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
                {bucket.label}
              </p>
              <p className="mt-4 font-display text-[2.4rem] font-semibold tracking-[-0.06em]">
                {bucket.count}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card overflow-hidden rounded-[32px]">
            <div className="border-b fine-rule px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
                Leads and projects
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-text-soft">
                  <tr className="border-b fine-rule">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Organization</th>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProjects.map((project) => {
                    const identifier = project.projectId ?? project.leadId;
                    return (
                      <tr key={identifier} className="border-b fine-rule last:border-b-0">
                        <td className="px-6 py-5">
                          <div className="font-medium text-foreground">{project.customerName}</div>
                          <div className="mt-1 text-xs text-text-soft">{identifier}</div>
                        </td>
                        <td className="px-6 py-5 text-text-soft">{project.organization}</td>
                        <td className="px-6 py-5 text-text-soft">{project.selectedProduct}</td>
                        <td className="px-6 py-5">
                          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-text-soft">
                            {statusLabels[project.status]}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:${project.phone.replace(/\s+/g, "")}`}
                              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-text-soft"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${project.phone.replace(/\D/g, "")}`}
                              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-text-soft"
                            >
                              WhatsApp
                            </a>
                            <Link
                              href={`/projects/${identifier}`}
                              className="rounded-full border border-accent px-3 py-1 text-xs text-foreground"
                            >
                              {project.projectId ? "Open Project" : "Convert to Project"}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
                Operating rules
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-text-soft">
                <li>No cart or checkout state exists anywhere in this flow.</li>
                <li>Every requirement is converted into a project document, not an order history line item.</li>
                <li>Quotation and production specification are separate outputs.</li>
                <li>Payment visibility stays admin-controlled and explicit.</li>
              </ul>
            </div>

            <div className="surface-card rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
                Future VEDA handoff
              </p>
              <p className="mt-4 text-sm leading-7 text-text-soft">
                Each project carries a `manufacturingOrderReady` flag and spec revision
                marker so the approved production sheet can later become a VEDA manufacturing order without reshaping the workspace model.
              </p>
            </div>
          </div>
        </section>
      </main>
    </WorkspaceShell>
  );
}
