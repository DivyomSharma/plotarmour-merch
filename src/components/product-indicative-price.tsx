import type { CatalogProduct } from "@/lib/product-catalog";

export function ProductIndicativePrice({
  product,
}: {
  product: Pick<
    CatalogProduct,
    "bulkPriceMarkedUp" | "samplePriceMarkedUp"
  >;
}) {
  return (
    <div className="border-t fine-rule pt-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
            Indicative Bulk Price
          </p>
          <p
            aria-label={`${product.bulkPriceMarkedUp} per unit; indicative, blank garment, excluding GST. Final price confirmed in quote.`}
            className="mt-2 font-display text-[1.45rem] tracking-[-0.05em] text-foreground"
          >
            {product.bulkPriceMarkedUp}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
            Sample Basis
          </p>
          <p
            aria-label={`${product.samplePriceMarkedUp} sample basis; indicative, blank garment, excluding GST. Final price confirmed in quote.`}
            className="mt-2 font-display text-[1.45rem] tracking-[-0.05em] text-foreground"
          >
            {product.samplePriceMarkedUp}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-text-soft">
        Indicative, blank garment, ex-GST. Final price confirmed in quote.
      </p>
    </div>
  );
}
