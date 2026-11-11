import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CategoryGrid } from '@/components/home/category-grid';
import { ActiveFilters } from '@/components/listing/active-filters';
import { FilterBar } from '@/components/listing/filter-bar';
import { NoResults } from '@/components/listing/no-results';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { QuickAddButton } from '@/components/product/quick-add-button';
import { CategoryChips } from '@/components/search/category-chips';
import { MatchingStores } from '@/components/search/matching-stores';
import { NoMatches } from '@/components/search/no-matches';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Container } from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import {
  getCategories,
  getListing,
  getListingFacets,
  getSearchStores,
} from '@/lib/catalog';
import {
  hasFilters,
  listingHref,
  PAGE_SIZE,
  parseListingParams,
} from '@/lib/listing';

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = parseListingParams(await searchParams);
  return {
    title: q ? `Results for “${q}”` : 'Search',
    // Result pages are endless and thin; keep them out of search engines.
    robots: { index: false, follow: true },
  };
}

function plural(count: number, one: string, many: string) {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? one : many}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseListingParams(await searchParams);
  const { q } = filters;
  // An empty search box submits ?q=; there's nothing to search for.
  if (!q) redirect(listingHref({ ...filters, q: undefined }));

  const [listing, facets, categories, stores] = await Promise.all([
    getListing(filters),
    getListingFacets(q),
    getCategories(Number.POSITIVE_INFINITY, q),
    getSearchStores(q),
  ]);
  // Every product has a category, so this is everything the query matched
  // before any filter.
  const queryTotal = categories.reduce((sum, c) => sum + c.productCount, 0);
  // Nothing matched: offer the shop's categories to browse instead.
  const popular = queryTotal === 0 ? await getCategories(6) : [];

  return (
    <div className="pb-16 sm:pb-24">
      <Container className="pt-8">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
        />

        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h1 className="min-w-0 font-display text-[clamp(40px,5.4vw,72px)] leading-none tracking-[-0.02em] [overflow-wrap:anywhere]">
            Results for <em>“{q}”</em>
          </h1>
          <p className="mb-2 text-[15px] text-body">
            <strong className="font-semibold text-ink tabular-nums">
              {plural(queryTotal, 'result', 'results')}
            </strong>
            {queryTotal > 0 &&
              ` · ${plural(facets.stores.length, 'store', 'stores')} · ${plural(
                categories.length,
                'category',
                'categories',
              )}`}
          </p>
        </div>

        {queryTotal === 0 ? (
          <div className="mt-10">
            <NoMatches q={q} />
          </div>
        ) : (
          <>
            <div className="mt-10">
              <MatchingStores stores={stores} />
            </div>

            <section aria-labelledby="results-heading" className="mt-12">
              <h2 id="results-heading" className="sr-only">
                Products
              </h2>
              <CategoryChips
                chips={[
                  {
                    label: 'All results',
                    count: queryTotal,
                    href: listingHref(filters, { category: undefined }),
                    selected: !filters.category,
                  },
                  ...categories.map((c) => ({
                    label: c.name,
                    count: c.productCount,
                    href: listingHref(filters, { category: c.slug }),
                    selected: c.slug === filters.category,
                  })),
                ]}
              />

              <div className="mt-4">
                <FilterBar
                  filters={filters}
                  facets={facets}
                  showCategory={false}
                />
              </div>

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
                        {plural(listing.total, 'result', 'results')}
                      </strong>
                      {hasFilters(filters) ? ' that match your filters.' : '.'}
                    </p>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </Container>
      {/* CategoryGrid brings its own page container, so it sits outside ours. */}
      {queryTotal === 0 && <CategoryGrid categories={popular} />}
    </div>
  );
}
