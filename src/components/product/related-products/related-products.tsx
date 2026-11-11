import { SectionHeading } from '@/components/home/section-heading';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { QuickAddButton } from '@/components/product/quick-add-button';
import { getRelatedProducts } from '@/lib/catalog';

export type RelatedProductsProps = {
  /** Products left out of the list: the one on the page, or what's already in the bag. */
  excludeProductIds: string[];
  /**
   * Products come from the same top-level categories as these.
   * Empty means any category.
   */
  categoryIds: string[];
};

/** "You may also like": products from the same top-level categories. Hidden when there are none. */
export async function RelatedProducts({
  excludeProductIds,
  categoryIds,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(excludeProductIds, categoryIds);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <SectionHeading id="related-heading" title="You may also like" />
      <div className="mt-8">
        <ProductGrid>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              label={product.isNew ? 'New' : undefined}
              // Quick add can't pick a size or colour, so variant
              // products go through their product page instead.
              quickAdd={
                !product.hasVariants && (
                  <QuickAddButton
                    productId={product.id}
                    productName={product.name}
                  />
                )
              }
            />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}
