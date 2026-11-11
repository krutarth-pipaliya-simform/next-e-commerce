import Image from 'next/image';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { SealIcon, StoreIcon } from '@/components/ui/icons';
import { getSellerSummary } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';

export type SellerCardProps = {
  /** The product on the page, left out of "More from". */
  productId: string;
  /** The selling store. */
  store: { id: string; name: string; slug: string; verified: boolean };
};

/**
 * "Sold and shipped by": the store's description, rating, product count
 * and year it joined, with links to the store and a few of its other
 * products. The page links to it as #seller.
 */
export async function SellerCard({ productId, store }: SellerCardProps) {
  const seller = await getSellerSummary(store.id, productId);
  const storeHref = `/stores/${store.slug}`;
  const facts = [
    seller.rating.count > 0 && {
      label: 'Store rating',
      value: seller.rating.average.toFixed(1),
      note: `(${seller.rating.count.toLocaleString('en-IN')})`,
    },
    {
      label: 'Products',
      value: seller.productCount.toLocaleString('en-IN'),
    },
    seller.since && { label: 'On Daylight', value: `Since ${seller.since}` },
  ].filter((fact) => !!fact);

  return (
    <section
      id="seller"
      aria-labelledby="seller-heading"
      className="flex scroll-mt-28 flex-wrap items-center gap-x-12 gap-y-8 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-8"
    >
      <div className="flex flex-[1_1_360px] flex-col gap-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-16 flex-none place-items-center rounded-full bg-sunken"
          >
            <StoreIcon width={26} height={26} />
          </span>
          <div>
            <p className="text-[13px] text-muted">Sold and shipped by</p>
            <h2
              id="seller-heading"
              className="mt-0.5 flex items-center gap-2 font-display text-[32px] leading-[1.1] tracking-[-0.02em]"
            >
              {store.name}
              {store.verified && (
                <>
                  <SealIcon width={20} height={20} />
                  <span className="sr-only">Verified store</span>
                </>
              )}
            </h2>
          </div>
        </div>

        {seller.description && (
          <p className="max-w-[52ch] text-[15px] leading-[1.6] text-body">
            {seller.description}
          </p>
        )}

        <dl className="grid max-w-xl grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[13px] text-muted">{fact.label}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {fact.value}
                {'note' in fact && (
                  <span className="ml-1 font-normal text-body">
                    {fact.note}
                    <span className="sr-only"> reviews</span>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href={storeHref}
          className={buttonClasses({ className: 'self-start px-6' })}
        >
          Visit store<span className="sr-only">: {store.name}</span>
        </Link>
      </div>

      {seller.products.length > 0 && (
        <div className="min-w-0 flex-[1_1_420px]">
          <p className="mb-3 text-sm font-medium">More from {store.name}</p>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {seller.products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.id}`}
                  className="group flex flex-col gap-2"
                >
                  <span className="stage relative block h-[150px] overflow-hidden rounded-stage shadow-[inset_0_0_0_1px_var(--color-hairline)]">
                    {product.image && (
                      <Image
                        src={product.image.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 180px"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                  </span>
                  <span className="text-sm font-medium group-hover:underline">
                    {product.name}
                  </span>
                  <span className="-mt-1.5 text-sm font-semibold tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
