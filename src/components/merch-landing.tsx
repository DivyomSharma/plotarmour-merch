"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";
import { buildWhatsAppLink } from "@/lib/contact";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import { LeadForm } from "@/components/lead-form";
import { MagneticButton } from "@/components/magnetic-button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ThemeToggle } from "@/components/theme-toggle";

const stats = [
  { label: "Turnaround", value: "7-10 days" },
  { label: "MOQ", value: "30 units" },
  { label: "Quote Window", value: "Within 24 hours" },
  { label: "Delivery", value: "Pan-India" },
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

const capabilities = [
  {
    title: "Apparel",
    description: "Hoodies, tees, varsity jackets, caps, and custom trims.",
    image: "/products/hoodie.png",
  },
  {
    title: "Drinkware",
    description: "Bottles and utility pieces that work for gifting and daily use.",
    image: "/products/bottle.png",
  },
  {
    title: "Swag Kits",
    description: "Multi-item gift kits with sleeves, inserts, packaging, and dispatch planning.",
    image: "/products/kit.png",
  },
  {
    title: "Headwear",
    description: "Caps and crew accessories for teams, outdoor activations, and event staff.",
    image: "/products/cap.png",
  },
];

const process = [
  {
    number: "01",
    title: "Brief",
    description: "You tell us the audience, budget band, quantity, and delivery timeline.",
  },
  {
    number: "02",
    title: "Concept",
    description: "We shape the product mix, design direction, finishes, and packaging route.",
  },
  {
    number: "03",
    title: "Approval",
    description: "Mockups, specifications, and commercial details are aligned before production.",
  },
  {
    number: "04",
    title: "Delivery",
    description: "We produce, pack, sort, and deliver without sending you through vendor loops.",
  },
];

const reasons = [
  "Design-first thinking that still respects procurement realities.",
  "Low MOQ from 30 units for smaller internal or campus runs.",
  "One partner across design, sourcing, production, packaging, and dispatch.",
  "Fast execution without making the final output feel rushed.",
];

const testimonials = [
  {
    quote:
      "The final merch looked far more considered than what we usually get from bulk vendors. The process was also surprisingly clean.",
    name: "People Operations Lead",
    role: "Series A startup",
  },
  {
    quote:
      "PlotArmour helped us land merchandise that actually matched our fest identity instead of feeling like a generic print run.",
    name: "Fest Core Committee",
    role: "Engineering college",
  },
  {
    quote:
      "The best part was not having to coordinate multiple vendors for apparel, packaging, and delivery. It all came through one channel.",
    name: "Admin & HR Team",
    role: "Corporate events team",
  },
];

const packages = [
  {
    name: "Starter",
    range: "30-100 units",
    detail: "Best for internal teams, farewell runs, committee drops, and early-stage gifting.",
  },
  {
    name: "Growth",
    range: "100-500 units",
    detail: "Best for larger campus programs, onboarding waves, launch kits, and event merchandise.",
  },
  {
    name: "Scale",
    range: "500+ units",
    detail: "Best for national rollouts, large employee programs, and multi-location dispatch planning.",
  },
];

const trustMarks = ["Design to delivery", "Low MOQ from 30", "Premium packaging", "Pan-India dispatch"];

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
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        Built for
      </p>
      <h3 className="mt-4 font-display text-[1.7rem] font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-text-soft">{description}</p>
    </div>
  );
}

function CapabilityCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="surface-card rounded-[30px] p-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-surface">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <h3 className="mt-5 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-text-soft">{description}</p>
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
      <p className="font-display text-[2.5rem] font-semibold tracking-[-0.06em] text-accent">
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

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="surface-card rounded-[28px] p-6">
      <p className="text-base leading-8 text-foreground">{quote}</p>
      <div className="mt-8 border-t fine-rule pt-5">
        <p className="font-display text-[1.2rem] font-semibold tracking-[-0.04em] text-foreground">
          {name}
        </p>
        <p className="mt-1 text-sm text-text-soft">{role}</p>
      </div>
    </div>
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
        <MagneticButton href="#lead-form" className="w-full justify-center" invert>
          Get a quote
        </MagneticButton>
      </div>
    </div>
  );
}

export function MerchLanding() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const wordY = useTransform(scrollYProgress, [0, 0.2], [0, shouldReduceMotion ? 0 : -50]);

  const quickWhatsAppLink = buildWhatsAppLink(
    "Hi PlotArmour Merch, we want a quote for bulk merch.",
  );

  return (
    <div className="relative overflow-x-clip bg-background text-foreground">
      <FloatingWhatsApp />

      <header className="sticky top-0 z-40 border-b fine-rule bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <a href="#top" aria-label="PlotArmour Merch home">
            <BrandLogo />
          </a>

          <nav className="hidden items-center gap-6 text-sm text-text-soft md:flex">
            <a href="#audiences" className="transition-colors hover:text-foreground">
              Who it&apos;s for
            </a>
            <a href="#products" className="transition-colors hover:text-foreground">
              Categories
            </a>
            <a href="#process" className="transition-colors hover:text-foreground">
              Process
            </a>
            <a href="#proof" className="transition-colors hover:text-foreground">
              Proof
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton href="#lead-form" className="hidden md:inline-flex">
              Get a quote
            </MagneticButton>
          </div>
        </div>
      </header>

      <main>
        <section id="top" className="hero-grid relative overflow-hidden border-b fine-rule">
          <HeroAtmosphere />

          <motion.div
            style={{ y: wordY }}
            className="pointer-events-none absolute top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-[12vw] font-semibold tracking-[-0.08em] text-foreground/[0.035] xl:block"
            aria-hidden="true"
          >
            PLOTARMOUR MERCH
          </motion.div>

          <div className="mx-auto flex min-h-[calc(100svh-81px)] max-w-7xl items-center justify-center px-4 py-14 md:px-6 lg:py-18">
            <ScrollReveal className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
              <SectionEyebrow>Bulk merch and gifting, handled end to end</SectionEyebrow>
              <h1 className="mt-7 font-display text-[3rem] font-semibold leading-[0.92] tracking-[-0.08em] text-foreground sm:text-[4.5rem] xl:text-[5.75rem]">
                Premium merch and gifting for teams that care how they show up.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-text-soft md:text-lg">
                PlotArmour designs, manufactures, and delivers bulk apparel, swag
                kits, and corporate gifting for campuses, startups, and modern
                teams that want the final output to feel considered.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="#lead-form">Get a quote in 24 hours</MagneticButton>
                <MagneticButton href="#products" invert>
                  Browse categories
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
                  Built for institutions, teams, and brands that need merchandise
                  to feel well made.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-text-soft">
                  This is a lead-generation site for serious bulk enquiries, so the
                  structure is designed to answer the questions a buyer actually has:
                  fit, quality, MOQ, speed, and delivery confidence.
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
                    Apparel, swag, and gifting categories presented with a cleaner B2B lens.
                  </h2>
                </div>
                <p className="max-w-xl text-base leading-8 text-text-soft">
                  We have kept the range broad, but the presentation restrained.
                  The goal is to make category choice easier for teams placing
                  structured bulk orders.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {capabilities.map((capability, index) => (
                <ScrollReveal key={capability.title} delay={index * 0.05}>
                  <CapabilityCard {...capability} />
                </ScrollReveal>
              ))}
            </div>
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
                A simple production flow that feels dependable from brief to delivery.
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
                Sleek enough for modern brands, operational enough for bulk execution.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-text-soft">
                The redesign is intentionally calmer because the audience here is
                not browsing for entertainment. They are assessing whether you can
                handle quality, clarity, and delivery without friction.
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
                  We have intentionally toned down the treatment of social proof
                  so it reads like credibility, not decoration.
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

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.name} delay={index * 0.06}>
                  <TestimonialCard {...testimonial} />
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
                    Clear entry points for small, mid-scale, and large bulk programs.
                  </h2>
                </div>
                <p className="max-w-xl text-base leading-8 text-text-soft">
                  No pricing here by design. The range framing simply makes it easier
                  for a buyer to understand where their requirement sits.
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

        <section
          id="lead-form"
          className="section-shell px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ScrollReveal>
              <SectionEyebrow>Final CTA</SectionEyebrow>
              <h2 className="mt-6 max-w-2xl font-display text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.07em] text-foreground md:text-[4.6rem]">
                Ready to move from idea to quote?
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-text-soft">
                Send the brief and we&apos;ll respond with the right product mix,
                execution route, and a practical next step for your order size.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="#lead-form">Get a quote</MagneticButton>
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

            <ScrollReveal delay={0.1}>
              <LeadForm />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
