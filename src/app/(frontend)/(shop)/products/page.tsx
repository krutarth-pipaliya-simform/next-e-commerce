import type { Metadata } from 'next';
import { ActiveFilters } from '@/components/listing/active-filters';
import { FilterBar } from '@/components/listing/filter-bar';
import { NoResults } from '@/components/listing/no-results';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { QuickAddButton } from '@/components/product/quick-add-button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Container } from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { findCategory, getListing, getListingFacets } from '@/lib/catalog';
import {
  hasFilters,
  listingHref,
  PAGE_SIZE,
  parseListingParams,
} from '@/lib/listing';

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { category } = parseListingParams(await searchParams);
  const match = category ? await findCategory(category) : undefined;
  return {
    title: match ? match.name : 'Shop all products',
    description: match
      ? `Shop ${match.name.toLowerCase()} from verified independent stores on Daylight.`
      : 'Every product from verified independent stores on Daylight.',
  };
}

function plural(count: number, one: string, many: string) {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? one : many}`;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = parseListingParams(await searchParams);
  const [listing, facets] = await Promise.all([
    getListing(filters),
    getListingFacets(),
  ]);
  const title = listing.category?.name ?? 'All products';

  return (
    <Container className="pt-8 pb-16 sm:pb-24">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: title },
        ]}
      />

      <div className="mt-1 mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h1 className="font-display text-[clamp(36px,5.6vw,80px)] leading-none tracking-[-0.02em]">
          {title}
        </h1>
        {listing.total > 0 && (
          <p className="mb-2 text-[15px] text-body">
            <strong className="font-semibold text-ink tabular-nums">
              {plural(listing.total, 'product', 'products')}
            </strong>{' '}
            from {plural(listing.storeCount, 'store', 'stores')}
          </p>
        )}
      </div>

      <FilterBar filters={filters} facets={facets} />

      <div className="mt-4 mb-6">
        <ActiveFilters filters={filters} facets={facets} />
      </div>

      {listing.products.length > 0 ? (
        <ProductGrid>
          {listing.products.map((product) => (
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
      ) : (
        <NoResults filters={filters} />
      )}

      <div className="mt-12">
        {listing.pageCount > 1 ? (
          <Pagination
            page={listing.page}
            pageCount={listing.pageCount}
            total={listing.total}
            pageSize={PAGE_SIZE}
            hrefFor={(page) => listingHref(filters, { page })}
          />
        ) : (
          listing.total > 0 && (
            <p className="border-t border-hairline pt-6 text-sm text-body">
              Showing all{' '}
              <strong className="font-semibold text-ink tabular-nums">
                {plural(listing.total, 'product', 'products')}
              </strong>
              {hasFilters(filters) ? ' that match your filters.' : '.'}
            </p>
          )
        )}
      </div>
    </Container>
  );
}
