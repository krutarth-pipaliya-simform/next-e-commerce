import Link from 'next/link';
import { CategoryGrid } from '@/components/home/category-grid';
import { ColourShelf } from '@/components/home/colour-shelf';
import { FeaturedStores } from '@/components/home/featured-stores';
import { Hero } from '@/components/home/hero';
import { HomeSection } from '@/components/home/home-section';
import { SectionHeading } from '@/components/home/section-heading';
import { SellBanner } from '@/components/home/sell-banner';
import { ValueBand } from '@/components/home/value-band';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { QuickAddButton } from '@/components/product/quick-add-button';
import { buttonClasses } from '@/components/ui/button';
import {
  getCategories,
  getFeaturedStores,
  getTrendingProducts,
} from '@/lib/catalog';

export default async function HomePage() {
  const [products, categories, { stores, storeCount }] = await Promise.all([
    getTrendingProducts(),
    getCategories(),
    getFeaturedStores(),
  ]);

  return (
    <div className="pb-16 sm:pb-24">
      {/* An image-less product would leave the hero stage blank. */}
      <Hero products={products.filter((p) => p.image).slice(0, 3)} />
      <CategoryGrid categories={categories} />
      <ColourShelf />

      <HomeSection id="trending-heading" space="m">
        <SectionHeading
          id="trending-heading"
          title="Trending now"
          aside={
            products.length > 0 && (
              <Link
                href="/products"
                className="inline-flex h-11 items-center text-[15px] font-medium text-accent"
              >
                Shop all
              </Link>
            )
          }
        />
        {products.length > 0 ? (
          <div className="mt-8">
            <ProductGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  label={product.isNew ? 'New' : undefined}
                  // Quick add can't pick a size or colour, so variant
                  // products go through the product page instead.
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
        ) : (
          <div className="mt-8 flex flex-col items-start gap-4 rounded-panel bg-surface p-8">
            <p className="font-display text-[32px] leading-none tracking-[-0.02em]">
              The shelves are still empty.
            </p>
            <p className="max-w-md text-[15px] text-body">
              Products appear here once a store is approved and publishes its
              first item.
            </p>
            <Link
              href="/sell"
              className={buttonClasses({ variant: 'secondary' })}
            >
              Open a store
            </Link>
          </div>
        )}
      </HomeSection>

      <FeaturedStores stores={stores} storeCount={storeCount} />
      <ValueBand />
      <SellBanner />
    </div>
  );
}
