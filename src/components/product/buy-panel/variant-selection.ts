import type { ProductVariantOption } from '@/lib/catalog';

export { MAX_QUANTITY, stockStatus, type StockTone } from '@/lib/cart-rules';

/** The picked colour and size, lower case; null where variants don't vary by it. */
export type Selection = { color: string | null; size: string | null };

export function findVariant(
  variants: ProductVariantOption[],
  { color, size }: Selection,
) {
  return variants.find((v) => v.color === color && v.size === size);
}

/** The first variant in stock, or the first variant when all are sold out. */
export function initialSelection(variants: ProductVariantOption[]): Selection {
  const variant = variants.find((v) => v.stock > 0) ?? variants[0];
  return { color: variant?.color ?? null, size: variant?.size ?? null };
}

/**
 * Switches colour, keeping the size when the new colour comes in it and
 * otherwise moving to that colour's first size in stock.
 */
export function selectColour(
  variants: ProductVariantOption[],
  current: Selection,
  color: string,
): Selection {
  const inColour = variants.filter((v) => v.color === color);
  if (inColour.some((v) => v.size === current.size))
    return { color, size: current.size };
  const variant = inColour.find((v) => v.stock > 0) ?? inColour[0];
  return { color, size: variant?.size ?? null };
}

/** Stock across every size of a colour. */
export function colourStock(variants: ProductVariantOption[], color: string) {
  return variants
    .filter((v) => v.color === color)
    .reduce((sum, v) => sum + v.stock, 0);
}
