import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagneticButton } from "@/components/magnetic-button";
import { ProductIndicativePrice } from "@/components/product-indicative-price";
import { WorkspaceShell } from "@/components/workspace-shell";
import { buildWhatsAppLink } from "@/lib/contact";
import { catalogProducts, type CatalogProduct } from "@/lib/product-catalog";

const productImages: Record<CatalogProduct["category"], string> = {
  "Oversized Tees": "/products/tshirt.png",
  "Round Neck Tees": "/products/tshirt.png",
  "Polo T-Shirts": "/products/tshirt.png",
  Hoodies: "/products/hoodie.png",
  "Kids & Bottomwear": "/products/tshirt.png",
  "Sweatshirts & Jackets": "/products/varsity.png",
};

function getProductBySlug(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    material: product.material,
    category: product.category,
  };
  const quoteHref = `/order?kit=${encodeURIComponent(product.name)}`;
  const whatsappHref = buildWhatsAppLink(
    `Hi PlotArmour Merch, I would like a quote for ${product.name}.`,
  );

  return (
    <WorkspaceShell
      eyebrow={`${product.category} · ${product.code}`}
      title={product.name}
      description={product.description}
      titleClassName="leading-[0.98] tracking-[-0.06em]"
    >
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
        <Link
          href="/#products"
          className="inline-flex text-sm font-semibold text-text-soft underline decoration-[color:var(--border-strong)] underline-offset-4 transition-colors hover:text-foreground"
        >
          Back to catalogue
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-hidden rounded-[30px] border fine-rule bg-surface">
            <div className="relative aspect-[4/3] bg-surface-soft">
              <Image
                src={productImages[product.category]}
                alt={`${product.category} illustrative garment type`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <p className="px-5 py-4 text-xs leading-5 text-text-soft md:px-7">
              Illustrative garment type, not the exact product.
            </p>
          </section>

          <div className="space-y-6">
            <section className="surface-card rounded-[30px] p-5 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-text">
                Product facts
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["GSM", product.gsm],
                  ["Material", product.material],
                  ["Size range", product.sizes.join(", ")],
                  ["Colours", `${product.colorsCount} colours`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[20px] border border-[color:var(--border)] bg-surface-soft px-4 py-3"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
                      {label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="surface-card rounded-[30px] p-5 md:p-7">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Available colours
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <li
                    key={color}
                    className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-text-soft"
                  >
                    {color}
                  </li>
                ))}
              </ul>
              <h2 className="mt-7 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Sizes
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <li
                    key={size}
                    className="min-w-11 rounded-full border border-[color:var(--border)] px-3 py-2 text-center text-sm text-text-soft"
                  >
                    {size}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="surface-card rounded-[30px] p-5 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-text">
              Quantity bands
            </p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {["10–100", "100–500", "500+"].map((band, index) => (
                <li
                  key={band}
                  className="rounded-[20px] border border-[color:var(--border)] bg-surface-soft p-4"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 font-display text-xl tracking-[-0.05em] text-foreground">
                    {band}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-text-soft">
                    Volume pricing confirmed in your quote
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm text-text-soft">MOQ: 10 pieces.</p>
          </section>

          <section className="surface-card rounded-[30px] p-5 md:p-7">
            <ProductIndicativePrice product={product} />
            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton href={quoteHref}>Request quote</MagneticButton>
              <a
                href={whatsappHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--border-strong)] px-5 py-3 text-sm font-semibold tracking-[0.01em] text-foreground transition-colors hover:border-accent hover:bg-accent/8 md:px-6"
              >
                WhatsApp us
              </a>
            </div>
          </section>
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </WorkspaceShell>
  );
}
