"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { buildWhatsAppLink } from "@/lib/contact";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import { MagneticButton } from "@/components/magnetic-button";
import { ProductShowcase } from "@/components/product-showcase";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { kits } from "@/lib/kits";

const stats = [
  { label: "Live Styles", value: "21 SKUs" },
  { label: "MOQ", value: "10 pcs" },
  { label: "Fabric Range", value: "180-430 GSM" },
  { label: "Quote Flow", value: "Within 24 hours" },
];

const audiences = [
  {
    title: "Campuses & Clubs",
    description:
      "Fest merchandise, society drops, committee apparel, and batchwear with a stronger design point of view.",
  },
  {
    title: "Schools & Communities",
    description:
      "Farewell hoodies, house merchandise, and identity-led apparel programs that still feel premium.",
  },
  {
    title: "Startups & Brands",
    description:
      "Launch kits, internal merch, event drops, and branded apparel made to look consistent with modern brand systems.",
  },
  {
    title: "Corporate Teams",
    description:
      "Onboarding gifts, conference kits, team merchandise, and premium swag programs handled end to end.",
  },
];

const process = [
  {
    number: "01",
    title: "Brief",
    description:
      "You tell us the audience, budget band, quantity, and delivery timeline.",
  },
  {
    number: "02",
    title: "Concept",
    description:
      "We shape the product mix, design direction, finishes, and packaging route.",
  },
  {
    number: "03",
    title: "Approval",
    description:
      "Mockups, specifications, and commercial details are aligned before production.",
  },
  {
    number: "04",
    title: "Delivery",
    description:
      "We produce, pack, sort, and deliver without sending you through vendor loops.",
  },
];

const reasons = [
  "Design-first thinking that still respects procurement realities.",
  "Low MOQ of 10 pieces per style for smaller internal or campus runs.",
  "One partner across design, sourcing, production, packaging, and dispatch.",
  "Fast execution without making the final output feel rushed.",
];

const packages = [
  {
    name: "Starter",
    range: "10-100 units",
    detail:
      "Best for internal teams, farewell runs, committee drops, and early-stage gifting.",
  },
  {
    name: "Growth",
    range: "100-500 units",
    detail:
      "Best for larger campus programs, onboarding waves, launch kits, and event merchandise.",
  },
  {
    name: "Scale",
    range: "500+ units",
    detail:
      "Best for national rollouts, large employee programs, and multi-location dispatch planning.",
  },
];

const trustMarks = [
  "Design to delivery",
  "MOQ 10 pcs",
  "Premium packaging",
  "Pan-India dispatch",
];

function BrandLogo() {
  return (
    <span className="font-logo text-[1.48rem] font-normal leading-none tracking-[-0.1em] text-foreground sm:text-[1.72rem]">
      PLOTarmr
    </span>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card rounded-[28px] px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground md:text-[2rem]">
        {value}
      </p>
    </div>
  );
}

function AudienceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="surface-card rounded-[28px] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-text">
        Built for
      </p>
      <h3 className="mt-4 font-display text-[1.7rem] font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-text-soft">{description}</p>
    </div>
  );
}

function ProcessCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="surface-card rounded-[28px] p-6">
      <p className="font-display text-[2.5rem] font-semibold tracking-[-0.06em] text-accent-text">
        {number}
      </p>
      <h3 className="mt-6 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-text-soft">{description}</p>
    </div>
  );
}

function ReasonItem({ copy }: { copy: string }) {
  return (
    <div className="surface-card rounded-[24px] px-5 py-5">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
        <p className="text-sm leading-7 text-foreground">{copy}</p>
      </div>
    </div>
  );
}

function KitCard({
  name,
  summary,
  audience,
  slug,
}: {
  name: string;
  summary: string;
  audience: string;
  slug: string;
}) {
  return (
    <a
      href={`/kits/${slug}`}
      className="surface-card flex h-full flex-col rounded-[28px] p-6 transition-colors hover:border-[color:var(--border-strong)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-text">
        {audience}
      </p>
      <h3 className="mt-4 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-foreground">
        {name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-text-soft">{summary}</p>
      <span className="mt-6 text-sm font-semibold text-foreground">
        Explore kit &rarr;
      </span>
    </a>
  );
}

function PackageCard({
  name,
  range,
  detail,
}: {
  name: string;
  range: string;
  detail: string;
}) {
  return (
    <div className="surface-card rounded-[30px] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
        {range}
      </p>
      <h3 className="mt-6 font-display text-[2rem] font-semibold tracking-[-0.06em] text-foreground">
        {name}
      </h3>
      <p className="mt-4 text-sm leading-7 text-text-soft">{detail}</p>
      <div className="mt-8">
        <MagneticButton href="/order" className="w-full justify-center" invert>
          Order Now
        </MagneticButton>
      </div>
    </div>
  );
}

export function MerchLanding() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const wordY = useTransform(
    scrollYProgress,
    [0, 0.2],
    [0, shouldReduceMotion ? 0 : -50],
  );

  const quickWhatsAppLink = buildWhatsAppLink(
    "Hi PlotArmour Merch, we want a quote for bulk merch.",
  );

  return (
    <div className="relative overflow-x-clip bg-background pb-20 text-foreground sm:pb-0">
      <FloatingWhatsApp />

      <header className="sticky top-0 z-40 border-b fine-rule bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <a href="#top" aria-label="PLOTarmr: PlotArmour Merch home">
            <BrandLogo />
          </a>

          <nav className="hidden items-center gap-6 text-sm text-text-soft md:flex">
            <a
              href="#audiences"
              className="transition-colors hover:text-foreground"
            >
              Who it&apos;s for
            </a>
            <a
              href="#products"
              className="transition-colors hover:text-foreground"
            >
              Catalogue
            </a>
            <a href="#kits" className="transition-colors hover:text-foreground">
              Kits
            </a>
            <a
              href="#process"
              className="transition-colors hover:text-foreground"
            >
              Process
            </a>
            <a
              href="#proof"
              className="transition-colors hover:text-foreground"
            >
              Proof
            </a>
            <a
              href="/order"
              className="transition-colors hover:text-foreground"
            >
              Order Now
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton href="/order" className="hidden md:inline-flex">
              Order Now
            </MagneticButton>
          </div>
        </div>
      </header>

      <main>
        <section
          id="top"
          className="hero-grid relative overflow-hidden border-b fine-rule"
        >
          <HeroAtmosphere />

          <motion.div
            style={{ y: wordY }}
            className="pointer-events-none absolute top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-[12vw] font-semibold tracking-[-0.08em] text-foreground/[0.035] xl:block"
            aria-hidden="true"
          >
            PLOTARMOUR MERCH
          </motion.div>

          <div className="mx-auto flex min-h-[calc(100svh-81px)] max-w-7xl items-center justify-center px-4 py-14 md:px-6 lg:py-18">
            <ScrollReveal
              eager
              className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
            >
              <SectionEyebrow>
                Bulk merch and gifting, handled end to end
              </SectionEyebrow>
              <h1 className="mt-7 font-display text-[3rem] font-semibold leading-[0.92] tracking-[-0.08em] text-foreground sm:text-[4.5rem] xl:text-[5.75rem]">
                Your merchandise partner, from concept to doorstep.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-text-soft md:text-lg">
                Custom apparel, employee kits, event merchandise and corporate
                gifting, sourced, customised and delivered under one roof. One
                quotation, one point of contact. Got a budget per head? Tell us
                and we will build the package.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="/order">Order Now</MagneticButton>
                <MagneticButton href="#products" invert>
                  Browse catalogue
                </MagneticButton>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {trustMarks.map((mark) => (
                  <span
                    key={mark}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs text-text-soft"
                  >
                    {mark}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-shell border-b fine-rule px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 0.06}>
                <StatCard {...stat} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section
          id="audiences"
          className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionEyebrow>Who it&apos;s for</SectionEyebrow>
              <div className="mt-6 max-w-3xl">
                <h2 className="font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                  Built for institutions, teams, and brands that need
                  merchandise to feel well made.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-text-soft">
                  This is a serious B2B merchandise surface, so the structure is
                  designed to answer the questions a buyer actually has: fit,
                  quality, MOQ, speed, delivery confidence, and whether the
                  backend process feels managed.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {audiences.map((audience, index) => (
                <ScrollReveal key={audience.title} delay={index * 0.06}>
                  <AudienceCard {...audience} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="products"
          className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <SectionEyebrow>Capabilities</SectionEyebrow>
                  <h2 className="mt-6 font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                    Real products, real GSM bands, and source-backed visuals
                    presented in a cleaner B2B format.
                  </h2>
                </div>
                <p className="max-w-xl text-base leading-8 text-text-soft">
                  Every visible product below maps to a live catalog reference.
                  The goal is to let a buyer shortlist the exact base garment
                  before the quote and workspace flow begins.
                </p>
              </div>
            </ScrollReveal>

            <ProductShowcase />
          </div>
        </section>

        <section
          id="kits"
          className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionEyebrow>Ready-made kits</SectionEyebrow>
              <h2 className="mt-6 max-w-3xl font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                Come with a budget. We build the whole package.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-text-soft">
                Start from a curated kit or tell us your per-head budget, for
                example ₹500 per employee or ₹1,500 per attendee. Contents are
                indicative and quoted per order.
              </p>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {kits.map((kit, index) => (
                <ScrollReveal key={kit.name} delay={index * 0.05}>
                  <KitCard {...kit} />
                </ScrollReveal>
              ))}
            </div>
            <Link
              href="/kits"
              className="mt-8 inline-flex text-sm font-semibold text-foreground underline decoration-[color:var(--border-strong)] underline-offset-4"
            >
              View all kits
            </Link>
          </div>
        </section>

        <section
          id="process"
          className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionEyebrow>Process</SectionEyebrow>
              <h2 className="mt-6 max-w-3xl font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                A simple production flow that feels dependable from brief to
                delivery.
              </h2>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              {process.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 0.07}>
                  <ProcessCard {...step} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <ScrollReveal>
              <SectionEyebrow>Why PlotArmour</SectionEyebrow>
              <h2 className="mt-6 max-w-2xl font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                Sleek enough for modern brands, operational enough for bulk
                execution.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-text-soft">
                The redesign is intentionally calmer because the audience here
                is not browsing for entertainment. They are assessing whether
                you can handle quality, clarity, and delivery without friction.
              </p>
            </ScrollReveal>

            <div className="grid gap-4">
              {reasons.map((reason, index) => (
                <ScrollReveal key={reason} delay={index * 0.06}>
                  <ReasonItem copy={reason} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="proof"
          className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionEyebrow>Proof</SectionEyebrow>
              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <h2 className="max-w-3xl font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                  Signals of trust should feel structured, not noisy.
                </h2>
                <p className="max-w-xl text-base leading-8 text-text-soft">
                  Client names and photographed completed orders will appear
                  here once approved for publication.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                "Campus programs",
                "Onboarding kits",
                "Event merchandise",
                "Corporate gifting",
              ].map((mark, index) => (
                <ScrollReveal key={mark} delay={index * 0.04}>
                  <div className="surface-card rounded-full px-5 py-4 text-center text-sm text-text-soft">
                    {mark}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-b fine-rule px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <SectionEyebrow>Order bands</SectionEyebrow>
                  <h2 className="mt-6 font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-[4rem]">
                    Clear entry points for small, mid-scale, and large bulk
                    programs.
                  </h2>
                </div>
                <p className="max-w-xl text-base leading-8 text-text-soft">
                  No pricing here by design. The range framing simply makes it
                  easier for a buyer to understand where their requirement sits
                  before entering the project flow.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {packages.map((pack, index) => (
                <ScrollReveal key={pack.name} delay={index * 0.05}>
                  <PackageCard {...pack} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ScrollReveal>
              <SectionEyebrow>Order Flow</SectionEyebrow>
              <h2 className="mt-6 max-w-2xl font-display text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.07em] text-foreground md:text-[4.6rem]">
                Keep the landing page clean. Move the real work into the
                workspace.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-text-soft">
                The public site should market the catalogue and premium
                positioning. The operational stack lives behind Order Now: lead
                creation, discussion, project workspace, quotation, approvals,
                payments, production, and dispatch.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="/order">Order Now</MagneticButton>
                <MagneticButton
                  href={quickWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  invert
                >
                  WhatsApp us
                </MagneticButton>
              </div>
            </ScrollReveal>

            <ScrollReveal
              delay={0.1}
              className="surface-panel rounded-[30px] p-6 md:p-8"
            >
              <div className="grid gap-4">
                {[
                  "Lead created from short form",
                  "Internal sales discussion and qualification",
                  "Project ID and secure client workspace",
                  "Quotation preview, PDF, approvals, and revision history",
                  "Advance payment, production specification, and sample approval",
                  "Production, balance payment, dispatch, and timeline logging",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-[22px] border border-[color:var(--border)] px-4 py-4"
                  >
                    <span className="font-display text-xl text-accent-text">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-7 text-text-soft">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
