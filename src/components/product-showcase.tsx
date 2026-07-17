"use client";

import Image from "next/image";
import { useState } from "react";
import { MagneticButton } from "@/components/magnetic-button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { catalogCategories, catalogProducts, type CatalogProduct } from "@/lib/product-catalog";

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden rounded-[30px]">
      <div className="relative aspect-[4/4.5] overflow-hidden bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/30 to-transparent p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-[color:var(--border)] bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft backdrop-blur-md">
              {product.category}
            </span>
            <span className="rounded-full border border-[color:var(--border)] bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft backdrop-blur-md">
              {product.gsm} GSM
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {product.code}
            </p>
            <h3 className="mt-3 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-foreground">
              {product.name}
            </h3>
          </div>
          <p className="text-right text-xs uppercase tracking-[0.16em] text-text-soft">
            {product.colorsCount} colors
          </p>
        </div>

        <p className="mt-4 text-sm leading-7 text-text-soft">{product.description}</p>

        <div className="mt-5 grid gap-3 text-sm text-text-soft md:grid-cols-2">
          <div className="rounded-[20px] border border-[color:var(--border)] bg-surface-soft px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Material</p>
            <p className="mt-2 text-foreground">{product.material}</p>
          </div>
          <div className="rounded-[20px] border border-[color:var(--border)] bg-surface-soft px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Sizes</p>
            <p className="mt-2 text-foreground">{product.sizes.join(", ")}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color}
              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] text-text-soft"
            >
              {color}
            </span>
          ))}
          {product.colors.length > 4 ? (
            <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] text-text-soft">
              +{product.colors.length - 4} more
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 border-t fine-rule pt-5 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
              Quote Range
            </p>
            <p className="mt-2 font-display text-[1.45rem] tracking-[-0.05em] text-foreground">
              {product.bulkPriceMarkedUp}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
              Sample Basis
            </p>
            <p className="mt-2 font-display text-[1.45rem] tracking-[-0.05em] text-foreground">
              {product.samplePriceMarkedUp}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <MagneticButton href="/order" className="min-w-[160px] justify-center">
            Order Now
          </MagneticButton>
        </div>
      </div>
    </article>
  );
}

export function ProductShowcase() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof catalogCategories)[number]>("All");

  const visibleProducts =
    activeCategory === "All"
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === activeCategory);

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-3">
        {catalogCategories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-[color:var(--border)] text-text-soft hover:border-[color:var(--border-strong)] hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Styles", value: "21" },
          { label: "MOQ", value: "10 pcs" },
          { label: "GSM Range", value: "180-430" },
          { label: "Categories", value: "6" },
          { label: "Color Matrix", value: "1-14" },
          { label: "Use", value: "Quote-ready" },
        ].map((metric, index) => (
          <ScrollReveal key={metric.label} delay={index * 0.04}>
            <div className="surface-card rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
                {metric.label}
              </p>
              <p className="mt-3 font-display text-2xl tracking-[-0.05em] text-foreground">
                {metric.value}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product, index) => (
          <ScrollReveal key={product.slug} delay={index * 0.03}>
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
