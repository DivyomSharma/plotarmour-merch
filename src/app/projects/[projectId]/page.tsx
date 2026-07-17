import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getProjectByIdentifier } from "@/lib/merch-data";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-[30px] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
        {title}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProjectByIdentifier(projectId);

  if (!project) {
    notFound();
  }

  const pageTitle = project.projectId ?? `${project.leadId} pending conversion`;

  return (
    <WorkspaceShell
      eyebrow="Client project workspace"
      title={pageTitle}
      description={`${project.customerName} • ${project.organization} • ${project.selectedProduct}. This workspace holds requirements, mockups, quotation, payment checkpoints, production status, and dispatch visibility in one document-shaped surface.`}
    >
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Overview">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Client</p>
                <p className="mt-2 text-lg text-foreground">{project.customerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Organization</p>
                <p className="mt-2 text-lg text-foreground">{project.organization}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Product</p>
                <p className="mt-2 text-lg text-foreground">{project.selectedProduct}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Expected Quantity</p>
                <p className="mt-2 text-lg text-foreground">{project.expectedQuantity}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Project Controls">
            <div className="space-y-3 text-sm text-text-soft">
              <div className="rounded-[22px] border border-[color:var(--border)] px-4 py-4">
                <p className="font-medium text-foreground">Secure client access</p>
                <p className="mt-2">This is where OTP or magic-link access would attach.</p>
              </div>
              <div className="rounded-[22px] border border-[color:var(--border)] px-4 py-4">
                <p className="font-medium text-foreground">Quotation actions</p>
                <p className="mt-2">Preview, PDF export, WhatsApp share, email share, and version history belong here.</p>
              </div>
              <div className="rounded-[22px] border border-[color:var(--border)] px-4 py-4">
                <p className="font-medium text-foreground">Production spec handoff</p>
                <p className="mt-2">
                  VEDA sync: {project.vedaSync.manufacturingOrderReady ? "ready" : "not ready"} • {project.vedaSync.specRevision}
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Requirements">
            <div className="grid gap-3">
              {project.requirementSheet.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-6 border-b fine-rule pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-sm text-text-soft">{item.label}</span>
                  <span className="max-w-[60%] text-right text-sm text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Assets">
            <div className="space-y-3">
              {project.assets.map((asset) => (
                <Link
                  key={asset.label}
                  href={asset.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[20px] border border-[color:var(--border)] px-4 py-4 text-sm text-text-soft transition-colors hover:text-foreground"
                >
                  <span>{asset.label}</span>
                  <span>{asset.type}</span>
                </Link>
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Mockups">
            {project.mockups.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {project.mockups.map((mockup) => (
                  <div key={mockup.label} className="rounded-[22px] border border-[color:var(--border)] p-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-surface">
                      <Image src={mockup.preview} alt={mockup.label} fill className="object-cover" />
                    </div>
                    <p className="mt-3 text-sm text-foreground">{mockup.label}</p>
                    <p className="mt-1 text-xs text-text-soft">
                      {mockup.version} • {mockup.updatedAt}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-text-soft">
                Mockup slots exist for front, back, sleeve, neck label, hang tag,
                packaging, and other files. Version history should attach here.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Quotation and Payments">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Quote versions</p>
                <div className="mt-3 space-y-3">
                  {project.quotationVersions.length ? (
                    project.quotationVersions.map((quote) => (
                      <div
                        key={`${quote.version}-${quote.sentAt}`}
                        className="flex items-center justify-between rounded-[18px] border border-[color:var(--border)] px-4 py-3"
                      >
                        <span className="text-sm text-foreground">{quote.version}</span>
                        <span className="text-xs uppercase tracking-[0.12em] text-text-soft">
                          {quote.status.replace("_", " ")} • {quote.sentAt}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-soft">Quotation not generated yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-soft">Payments</p>
                <div className="mt-3 space-y-3">
                  {project.payments.length ? (
                    project.payments.map((payment) => (
                      <div
                        key={payment.label}
                        className="rounded-[18px] border border-[color:var(--border)] px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-foreground">{payment.label}</span>
                          <span className="text-sm text-foreground">{payment.amount}</span>
                        </div>
                        <p className="mt-2 text-xs text-text-soft">
                          {payment.status === "paid"
                            ? `Paid on ${payment.date} • ${payment.reference}`
                            : "Pending admin confirmation. QR remains visible until marked paid."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-soft">Payment schedule not created yet.</p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Production Status">
            <div className="space-y-3">
              {project.productionSteps.length ? (
                project.productionSteps.map((step) => (
                  <div key={step.label} className="flex items-center gap-4 rounded-[18px] border border-[color:var(--border)] px-4 py-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        step.status === "done"
                          ? "bg-accent"
                          : step.status === "active"
                            ? "bg-foreground"
                            : "bg-[color:var(--border-strong)]"
                      }`}
                    />
                    <span className="text-sm text-foreground">{step.label}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-text-soft">
                  Production status begins after quotation approval and advance payment.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Dispatch">
            {project.dispatch ? (
              <div className="space-y-3 text-sm text-text-soft">
                <p>
                  Courier: <span className="text-foreground">{project.dispatch.courier}</span>
                </p>
                <p>
                  Tracking Number:{" "}
                  <span className="text-foreground">{project.dispatch.trackingNumber}</span>
                </p>
                <p>
                  Dispatch Date: <span className="text-foreground">{project.dispatch.dispatchDate}</span>
                </p>
                <p>
                  Estimated Delivery:{" "}
                  <span className="text-foreground">{project.dispatch.estimatedDelivery}</span>
                </p>
                <Link
                  href={project.dispatch.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-accent px-4 py-2 text-foreground"
                >
                  Track Shipment
                </Link>
              </div>
            ) : (
              <p className="text-sm leading-7 text-text-soft">
                Courier, tracking number, tracking URL, dispatch date, and ETA will appear here once the project enters dispatch.
              </p>
            )}
          </SectionCard>
        </section>

        <section className="mt-6">
          <SectionCard title="Timeline">
            <div className="space-y-4">
              {project.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-4">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm text-foreground">{event.label}</p>
                    <p className="mt-1 text-xs text-text-soft">
                      {event.occurredAt} • {event.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </main>
    </WorkspaceShell>
  );
}
