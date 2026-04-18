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
import { TypeHeadline } from "@/components/type-headline";
import { InteractiveRedElement } from "@/components/interactive-red-element";
import { MarqueeBanner } from "@/components/marquee-banner";
import { MediaGallery } from "@/components/media-gallery";

const audiences = [
  {
    title: "Colleges & Clubs",
    description:
      "Fest merch, society drops, committee kits, and batch wear that feels built for the culture.",
    tags: ["Fests", "Societies", "Batches"],
  },
  {
    title: "Schools & Student Communities",
    description:
      "Farewell hoodies, house merch, and student identity pieces without the usual generic energy.",
    tags: ["Farewells", "House merch", "Class drops"],
  },
  {
    title: "Startups & Brands",
    description:
      "Launch-ready team merch, event drops, and brand wear that people actually keep wearing.",
    tags: ["Team merch", "Brand drops", "Launch kits"],
  },
  {
    title: "Corporates",
    description:
      "Swag kits, onboarding merch, and event gifting that looks premium instead of recycled.",
    tags: ["HR gifting", "Events", "Swag kits"],
  },
];

const products = [
  {
    name: "Hoodies",
    detail: "Heavyweight, oversized, farewell-ready, team-ready.",
    accent: "Layered blanks, labels, embroidery, print.",
    type: "hoodie",
  },
  {
    name: "T-Shirts",
    detail: "Daily-wear silhouettes with bold front, back, and sleeve hits.",
    accent: "Drops, event tees, and club uniforms.",
    type: "tshirt",
  },
  {
    name: "Bottles",
    detail: "Useful gifting pieces that still carry the brand hard.",
    accent: "Corporate kits, welcome boxes, premium swag.",
    type: "bottle",
  },
  {
    name: "Caps",
    detail: "Structured basics and event-ready headwear with clean execution.",
    accent: "Crew caps, outdoor events, promo runs.",
    type: "cap",
  },
  {
    name: "Swag Kits",
    detail: "Multi-item packaging built for onboarding, launches, and events.",
    accent: "Boxes, inserts, branded pack-ins, premium presentation.",
    type: "kit",
  },
  {
    name: "Varsity",
    detail: "Premium wool/leather blends for core team identity.",
    accent: "Chenille patches, embroidery, custom snaps.",
    type: "varsity",
  },
];

const steps = [
  {
    number: "01",
    title: "You tell us",
    description:
      "Your audience, vibe, quantity, timeline, and the stuff you absolutely do not want.",
  },
  {
    number: "02",
    title: "We design",
    description:
      "We build the concept, mockups, packaging direction, and production logic around the brief.",
  },
  {
    number: "03",
    title: "You approve",
    description:
      "We tighten the details, lock materials, and get the final go-ahead before production starts.",
  },
  {
    number: "04",
    title: "We deliver",
    description:
      "Merch packed, sorted, and shipped without making you chase five vendors.",
  },
];

const reasons = [
  "End-to-end execution from design to doorstep.",
  "Fast turnaround that still respects quality.",
  "Low MOQ options when the run is lean.",
  "Designs that look like a drop, not leftover stock.",
];

const placeholderLogos = [
  "BYTEFEST",
  "HOUSE IX",
  "ALPHA LABS",
  "HR DAY",
  "ROBOCLUB",
  "FOUNDERS WEEK",
];

const testimonials = [
  {
    quote:
      "PlotArmour gave our fest merch an actual identity. Students wore it after the event, which never happens with rushed bulk merch.",
    name: "Fest Core Team",
    role: "Engineering College",
  },
  {
    quote:
      "We needed onboarding kits that felt sharp, not predictable. The packaging and apparel landed way above the usual vendor standard.",
    name: "People Ops Lead",
    role: "Series A Startup",
  },
  {
    quote:
      "Fast turnaround, clean execution, zero chaos on delivery. That is usually the part where merch vendors fall apart.",
    name: "Admin & HR",
    role: "Corporate Events Team",
  },
];

const packages = [
  {
    name: "Starter",
    range: "30-100 units",
    detail:
      "For small teams, committee runs, farewell merch, and focused launches.",
  },
  {
    name: "Growth",
    range: "100-500 units",
    detail:
      "For campus-wide drops, team kits, event merch, and mid-scale gifting.",
  },
  {
    name: "Scale",
    range: "500+ units",
    detail:
      "For company-wide rollouts, high-volume campaigns, and full swag programs.",
  },
];

function BrandLogo() {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block w-[156px] sm:w-[182px]">
        <Image
          src="/brand/plotarmour-logo-white.png"
          alt="PlotArmour"
          width={2000}
          height={400}
          priority
          className="logo-dark h-auto w-full"
        />
        <Image
          src="/brand/plotarmour-logo-black.png"
          alt="PlotArmour"
          width={1949}
          height={356}
          priority
          className="logo-light h-auto w-full"
        />
      </span>
      <span className="hidden border-[3px] border-foreground px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] sm:inline-flex">
        Merch
      </span>
    </span>
  );
}

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex border-[3px] border-foreground bg-red-500 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white">
      {children}
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="brutal-panel bg-background px-4 py-4 text-foreground">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/60">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-black uppercase md:text-3xl text-foreground">
        {value}
      </p>
    </div>
  );
}

function AudienceCard({
  title,
  description,
  tags,
}: {
  title: string;
  description: string;
  tags: string[];
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -10,
              backgroundColor: "#ff2323",
              color: "#ffffff",
            }
      }
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="brutal-panel min-h-full bg-background p-6 text-foreground"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em]">Built for</p>
      <h3 className="mt-3 font-display text-2xl font-black uppercase leading-none">
        {title}
      </h3>
      <p className="mt-4 text-sm font-semibold leading-6 text-foreground/75">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="border-[3px] border-current px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em]"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function ProductGlyph({ type }: { type: string }) {
  if (type === "hoodie") {
    return (
      <svg viewBox="0 0 240 240" className="h-32 w-32" fill="none" aria-hidden="true">
        <path
          d="M76 72c8-19 24-28 44-28s36 9 44 28l28 20-20 46-18-12v72H86v-72l-18 12-20-46 28-20Z"
          stroke="currentColor"
          strokeWidth="12"
        />
        <path
          d="M102 78c6 10 14 14 18 14s12-4 18-14"
          stroke="currentColor"
          strokeWidth="12"
        />
      </svg>
    );
  }

  if (type === "tshirt") {
    return (
      <svg viewBox="0 0 240 240" className="h-32 w-32" fill="none" aria-hidden="true">
        <path
          d="M80 62c9 14 24 22 40 22s31-8 40-22l36 22-20 44-24-14v92H88v-92l-24 14-20-44 36-22Z"
          stroke="currentColor"
          strokeWidth="12"
        />
      </svg>
    );
  }

  if (type === "bottle") {
    return (
      <svg viewBox="0 0 240 240" className="h-32 w-32" fill="none" aria-hidden="true">
        <path
          d="M96 46h48v28l12 20v92c0 10-8 18-18 18h-36c-10 0-18-8-18-18V94l12-20V46Z"
          stroke="currentColor"
          strokeWidth="12"
        />
        <path d="M96 106h60" stroke="currentColor" strokeWidth="12" />
      </svg>
    );
  }

  if (type === "cap") {
    return (
      <svg viewBox="0 0 240 240" className="h-32 w-32" fill="none" aria-hidden="true">
        <path
          d="M62 132c0-29 26-52 58-52 33 0 58 23 58 52v12H62v-12Z"
          stroke="currentColor"
          strokeWidth="12"
        />
        <path
          d="M72 148c10 20 28 32 48 32s38-12 48-32"
          stroke="currentColor"
          strokeWidth="12"
        />
        <path
          d="M176 142c16 0 26 6 34 18-14 4-28 2-42-6"
          stroke="currentColor"
          strokeWidth="12"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 240" className="h-32 w-32" fill="none" aria-hidden="true">
      <path d="M54 82h132v104H54z" stroke="currentColor" strokeWidth="12" />
      <path d="M74 60h92v22H74z" stroke="currentColor" strokeWidth="12" />
      <path d="M86 112h68M86 142h54" stroke="currentColor" strokeWidth="12" />
    </svg>
  );
}

function ProductTile({
  name,
  detail,
  accent,
  type,
}: {
  name: string;
  detail: string;
  accent: string;
  type: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              rotateX: -6,
              rotateY: 8,
            }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group brutal-panel relative overflow-hidden bg-background p-6 text-foreground [transform-style:preserve-3d]"
    >
      <div className="absolute top-0 right-0 z-10 h-10 w-10 border-l-[3px] border-b-[3px] border-foreground bg-red-500 mix-blend-normal" />
      <div className="relative aspect-square w-full overflow-hidden border-[3px] border-foreground bg-surface">
        <Image
          src={`/products/${type}.png`}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
        />
      </div>
      <h3 className="mt-5 font-display text-3xl font-black uppercase leading-none">
        {name}
      </h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-foreground/75">{detail}</p>
      <p className="mt-4 border-t-[3px] border-foreground pt-4 text-[11px] font-black uppercase tracking-[0.16em]">
        {accent}
      </p>
    </motion.article>
  );
}

function ProcessStep({
  number,
  title,
  description,
  index,
}: {
  number: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <ScrollReveal delay={index * 0.08}>
      <div className="brutal-panel h-full bg-surface p-6 text-foreground">
        <p className="font-display text-5xl font-black text-red-500">
          {number}
        </p>
        <h3 className="mt-5 font-display text-2xl font-black uppercase text-foreground">
          {title}
        </h3>
        <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-foreground/60">
          {description}
        </p>
      </div>
    </ScrollReveal>
  );
}

function ReasonCard({ copy }: { copy: string }) {
  return (
    <div className="brutal-panel bg-background p-5 text-foreground">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-foreground bg-red-500 font-display text-2xl font-black text-white">
          +
        </span>
        <p className="text-base font-black uppercase leading-6">{copy}</p>
      </div>
    </div>
  );
}

function LogoBadge({ label }: { label: string }) {
  return (
    <div className="border-[3px] border-foreground px-4 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-foreground/72">
      {label}
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
    <div className="brutal-panel bg-background p-6 text-foreground">
      <p className="text-base font-semibold leading-7">{quote}</p>
      <div className="mt-6 border-t-[3px] border-foreground pt-4">
        <p className="font-display text-xl font-black uppercase">{name}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-foreground/60">
          {role}
        </p>
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
    <div className="brutal-panel bg-background p-6 text-foreground">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/60">
        {range}
      </p>
      <h3 className="mt-8 font-display text-4xl font-black uppercase text-foreground">
        {name}
      </h3>
      <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-foreground/60">
        {detail}
      </p>
      <div className="mt-6">
        <MagneticButton href="#lead-form" className="w-full justify-center" invert>
          Get Quote
        </MagneticButton>
      </div>
    </div>
  );
}

export function MerchLanding() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroWordY = useTransform(
    scrollYProgress,
    [0, 0.16],
    [0, shouldReduceMotion ? 0 : -60],
  );
  const accentY = useTransform(
    scrollYProgress,
    [0, 0.28],
    [0, shouldReduceMotion ? 0 : 80],
  );

  const quickWhatsAppLink = buildWhatsAppLink(
    "Hi PlotArmour Merch, we want a quote for bulk merch.",
  );

  return (
    <div className="relative overflow-x-clip bg-background text-foreground">
      <FloatingWhatsApp />

      <header className="sticky top-0 z-40 border-b-[4px] border-foreground bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <a href="#top" aria-label="PlotArmour Merch home">
            <BrandLogo />
          </a>
          <nav className="hidden items-center gap-5 text-xs font-black uppercase tracking-[0.16em] md:flex">
            <a href="#audiences" className="hover:text-red-500">
              Audience
            </a>
            <a href="#products" className="hover:text-red-500">
              Merch
            </a>
            <a href="#process" className="hover:text-red-500">
              System
            </a>
            <a href="#archive" className="hover:text-red-500">
              Archive
            </a>
            <a href="#proof" className="hover:text-red-500">
              Reputation
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton href="#lead-form" className="hidden md:inline-flex !min-h-12 !h-12 !py-0 !px-5 !text-xs">
              Get Quote
            </MagneticButton>
          </div>
        </div>
      </header>

      <main>
        <section
          id="top"
          className="hero-noise relative overflow-hidden border-b-[4px] border-foreground"
        >
          <HeroAtmosphere />
          <motion.div
            style={{ y: heroWordY }}
            className="pointer-events-none absolute top-22 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-[16vw] font-black uppercase leading-none text-foreground/6 lg:block"
            aria-hidden="true"
          >
            MERCH BULK SWAG DROP
          </motion.div>
          <InteractiveRedElement y={accentY} />
          <div className="mx-auto grid min-h-[calc(100svh-84px)] max-w-7xl items-center gap-10 px-4 py-12 md:px-6 md:py-16">
            <ScrollReveal className="relative z-10 max-w-5xl">
              <SectionTag>Bulk merch for teams that want edge</SectionTag>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl xl:text-[6.25rem]">
                <TypeHeadline text={"CUSTOM MERCH\nTHAT DOESN'T LOOK MID."} />
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">
                For colleges, schools, startups, and brands. We design,
                manufacture, and deliver bulk merch plus swag kits that feel
                premium, sharp, and built to be worn.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="#lead-form">
                  Get Quote in 24 Hours
                </MagneticButton>
                <MagneticButton href="#products" invert>
                  View Samples
                </MagneticButton>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <span className="border-[3px] border-foreground px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                  Design to delivery
                </span>
                <span className="border-[3px] border-foreground px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                  7-10 day turnaround
                </span>
                <span className="border-[3px] border-foreground px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                  MOQ from 30
                </span>
              </div>
            </ScrollReveal>
          </div>

          <div className="mx-auto grid max-w-7xl gap-4 border-t-[4px] border-foreground px-4 py-8 md:grid-cols-3 md:px-6">
            <StatChip label="Turnaround" value="7-10 Days" />
            <StatChip label="MOQ" value="30 Units" />
            <StatChip label="Lead Flow" value="Quote in 24h" />
          </div>
        </section>

        <MarqueeBanner />

        <section
          id="audiences"
          className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionTag>Who it&apos;s for</SectionTag>
              <div className="mt-6 max-w-4xl">
                <h2 className="font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                  Built for groups that need merch to land hard.
                </h2>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-muted">
                  Not for one-off impulse buys. This is bulk merch strategy for
                  communities, teams, launches, and gifting moments that need
                  impact.
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
          className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-4xl">
                  <SectionTag>Products</SectionTag>
                  <h2 className="mt-6 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                    Your merch stack, minus the boring stuff.
                  </h2>
                </div>
                <p className="max-w-xl text-base font-semibold leading-7 text-muted">
                  Hoodies, tees, bottles, caps, and full swag kits. No pricing
                  clutter. Just product direction that helps teams move fast.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <ScrollReveal key={product.name} delay={index * 0.05}>
                  <ProductTile {...product} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="process"
          className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionTag>How it works</SectionTag>
              <h2 className="mt-6 max-w-4xl font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                Fast process. Clear approvals. Zero vendor maze.
              </h2>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              {steps.map((step, index) => (
                <ProcessStep key={step.number} {...step} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ScrollReveal>
              <SectionTag>Why us</SectionTag>
              <h2 className="mt-6 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                Premium output without the premium vendor headache.
              </h2>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-muted">
                We handle concept, artwork, production logic, packaging, and
                delivery. You stay focused on the campaign, the event, or the
                team rollout.
              </p>
            </ScrollReveal>

            <div className="grid gap-5 grid-cols-1">
              {reasons.map((reason, index) => (
                <ScrollReveal key={reason} delay={index * 0.06}>
                  <ReasonCard copy={reason} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="archive" className="section-shell border-b-[4px] border-foreground py-16 md:py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <ScrollReveal>
              <SectionTag>Archive</SectionTag>
              <h2 className="mt-6 max-w-4xl font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                We let the merch speak for itself.
              </h2>
            </ScrollReveal>
          </div>
          <div className="mt-10">
            <MediaGallery />
          </div>
        </section>

        <section
          id="proof"
          className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <SectionTag>Reputation</SectionTag>
              <h2 className="mt-6 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                Trusted by teams that hate generic merch.
              </h2>
            </ScrollReveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {placeholderLogos.map((logo, index) => (
                <ScrollReveal key={logo} delay={index * 0.04}>
                  <LogoBadge label={logo} />
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

        <section className="section-shell border-b-[4px] border-foreground px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-4xl">
                  <SectionTag>Packages</SectionTag>
                  <h2 className="mt-6 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                    Start lean. Scale hard.
                  </h2>
                </div>
                <p className="max-w-xl text-base font-semibold leading-7 text-muted">
                  These are volume anchors, not rigid menus. Tell us the brief
                  and we build the right merch mix around it.
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
          className="section-shell border-b-[4px] border-foreground bg-red-500 px-4 py-16 text-black md:px-6 md:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <ScrollReveal>
              <p className="inline-flex border-[3px] border-black bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em]">
                Final CTA
              </p>
              <h2 className="mt-6 font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">
                Ready to drop your merch?
              </h2>
              <p className="mt-6 max-w-xl text-base font-bold leading-7 text-black/80">
                Send the brief. We will turn it into design direction,
                production logic, and a bulk quote you can actually act on.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="#lead-form">
                  Get Quote
                </MagneticButton>
                <MagneticButton
                  href={quickWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  invert
                >
                  WhatsApp Us
                </MagneticButton>
              </div>
              <div className="mt-10 space-y-3 text-sm font-black uppercase tracking-[0.16em] text-black/75">
                <p>Bulk hoodies, t-shirts, bottles, caps, and full swag kits.</p>
                <p>Designed in-house. Produced at scale. Delivered without drama.</p>
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
