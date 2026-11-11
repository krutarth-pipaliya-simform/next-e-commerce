import Image from 'next/image';
import Link from 'next/link';
import { HomeSection } from '@/components/home/home-section';
import { SectionHeading } from '@/components/home/section-heading';
import { SealIcon, StarIcon } from '@/components/ui/icons';
import { buttonClasses } from '@/components/ui/button';

export type FeaturedStore = {
  /** Store id, used as the list key. */
  id: string;
  /** Store name. */
  name: string;
  /** Slug for the `/stores/[slug]` link. */
  slug: string;
  /** Short description; hidden when null. */
  description: string | null;
  /** Published products in the store. */
  productCount: number;
  /** Rating across the store's published products. Hidden with no reviews. */
  rating: { average: number; count: number };
  /** Up to three recent products, for the image tiles. */
  products: {
    id: string;
    name: string;
    images: { url: string; altText: string | null }[];
  }[];
};

export type FeaturedStoresProps = {
  /** Stores to show. The section is hidden when empty. */
  stores: FeaturedStore[];
  /** Every store with something to sell, for the "See all" link. */
  storeCount: number;
};

export function FeaturedStores({ stores, storeCount }: FeaturedStoresProps) {
  if (stores.length === 0) return null;

  return (
    <HomeSection id="stores-heading">
      <SectionHeading
        id="stores-heading"
        title="Featured stores"
        aside={
          <Link
            href="/stores"
            className="inline-flex h-11 items-center text-[15px] font-medium text-accent"
          >
            {storeCount === 1
              ? 'See all stores'
              : `See all ${storeCount.toLocaleString('en-US')} stores`}
          </Link>
        }
      />
      <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </HomeSection>
  );
}

function StoreCard({
  store,
}: {
  /** The store to show. */
  store: FeaturedStore;
}) {
  // Always three tiles, so cards line up when a store has fewer products.
  const tiles = [0, 1, 2].map((index) => store.products[index]);

  return (
    <article className="flex flex-col gap-4 rounded-card bg-surface p-3 shadow-[0_1px_2px_rgb(17_18_20/0.04)]">
      <div aria-hidden="true" className="grid grid-cols-3 gap-2">
        {tiles.map((product, index) => {
          const image = product?.images[0];
          return (
            <span
              key={product?.id ?? index}
              className="stage relative aspect-square overflow-hidden rounded-stage"
            >
              {image && (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-contain p-3"
                />
              )}
            </span>
          );
        })}
      </div>
      <div className="flex flex-col gap-2.5 px-2 pb-2">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-[32px] leading-none tracking-[-0.02em]">
            {store.name}
          </h3>
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent">
            <SealIcon width={14} height={14} />
            Verified
          </span>
        </div>
        {store.description && (
          <p className="line-clamp-2 text-[15px] leading-[1.55] text-body">
            {store.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
            {store.rating.count > 0 && (
              <>
                <StarIcon className="text-ink" />
                <span className="font-medium text-ink">
                  {store.rating.average.toFixed(1)}
                </span>
                ({store.rating.count.toLocaleString('en-US')}
                <span className="sr-only"> reviews</span>)
              </>
            )}
            <span className={store.rating.count > 0 ? 'ml-2' : undefined}>
              {store.productCount}{' '}
              {store.productCount === 1 ? 'product' : 'products'}
            </span>
          </span>
          <Link
            href={`/stores/${store.slug}`}
            className={buttonClasses({ variant: 'secondary', size: 'sm' })}
          >
            Visit store<span className="sr-only">: {store.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
