import Image from 'next/image';
import Link from 'next/link';
import { GiftIcon, SealIcon, StarIcon } from '@/components/ui/icons';
import { buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import type { CatalogProduct } from '@/lib/catalog';
import { cn, formatPrice } from '@/lib/utils';

const popularSearches = [
  { label: 'Tangerine sneakers', dot: '#FF6A2B' },
  { label: 'Pink headphones', dot: '#FF5DA2' },
  { label: 'Cobalt kettles', dot: '#2747D9' },
];

/**
 * Home hero: serif headline, then a studio-sweep stage with popular
 * searches, up to three products and a glass card for the main one.
 * The products are the first three trending ones.
 */
export type HeroProps = {
  /**
   * Up to three products with images. The first is the main one with the
   * glass card; the next two sit either side. With none, the stage only
   * shows the popular searches.
   */
  products: CatalogProduct[];
};

export function Hero({ products }: HeroProps) {
  const [main, ...sides] = products;
  const [left, right] = sides;

  return (
    <section aria-labelledby="hero-heading" className="pt-10 sm:pt-[72px]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-7">
          <h1
            id="hero-heading"
            className="max-w-[900px] flex-[1_1_600px] font-display text-[clamp(44px,6.7vw,96px)] leading-[0.94] tracking-[-0.02em]"
          >
            Colour, sold by the people who <em>make</em> it.
          </h1>
          <div className="flex flex-[0_1_380px] flex-col gap-6 pb-1.5">
            <p className="text-[17px] leading-relaxed text-body">
              Sneakers, audio, kitchenware and more from independent stores. Our
              team reviews every store before it can sell anything.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className={buttonClasses({ className: 'h-[52px] px-6.5' })}
              >
                Shop new in
              </Link>
              <Link
                href="/stores"
                className={buttonClasses({
                  variant: 'secondary',
                  className: 'h-[52px] px-6',
                })}
              >
                Browse stores
              </Link>
            </div>
          </div>
        </div>

        <div className="stage relative mt-12 rounded-panel shadow-[inset_0_0_0_1px_rgb(17_18_20/0.06),0_1px_2px_rgb(17_18_20/0.04)]">
          <div
            className={cn(
              'flex flex-col gap-7 p-4 sm:gap-10 sm:px-[5%] sm:pt-6',
              main ? 'pb-10 sm:pb-[200px]' : 'pb-6',
            )}
          >
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <span className="mr-1 shrink-0 text-[13px] text-muted">
                Popular searches
              </span>
              {popularSearches.map(({ label, dot }) => (
                <Link
                  key={label}
                  href={`/search?q=${encodeURIComponent(label)}`}
                  className="glass-chrome inline-flex h-11 shrink-0 items-center gap-2 rounded-control px-4 text-sm font-medium whitespace-nowrap"
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ background: dot }}
                  />
                  {label}
                </Link>
              ))}
              <Link
                href="/deals"
                className="glass-chrome inline-flex h-11 shrink-0 items-center gap-2 rounded-control px-4 text-sm font-medium whitespace-nowrap"
              >
                <GiftIcon width={16} height={16} />
                Gifts under ₹2,000
              </Link>
            </div>

            {main && (
              <div
                className={cn(
                  'flex flex-wrap items-end justify-around gap-y-5 sm:flex-nowrap sm:gap-[2%]',
                  left && right ? 'sm:justify-between' : 'sm:justify-center',
                )}
              >
                {left && <SideProduct product={left} tagSide="right" />}
                <Link
                  href={`/product/${main.id}`}
                  aria-label={`${main.name}, ${formatPrice(main.price)}`}
                  className="relative order-first aspect-square w-full sm:order-none sm:w-[44%]"
                >
                  <ProductImage
                    product={main}
                    sizes="(max-width: 640px) 90vw, 560px"
                    eager
                  />
                </Link>
                {right && <SideProduct product={right} tagSide="left" />}
              </div>
            )}
          </div>

          {main && <HeroCard product={main} />}
        </div>
      </Container>
    </section>
  );
}

function ProductImage({
  product,
  sizes,
  eager,
}: {
  /** Product whose image to show. */
  product: CatalogProduct;
  /** `sizes` for next/image, matching the slot's rendered width. */
  sizes: string;
  /** The main hero image is the page's largest paint, so load it first. */
  eager?: boolean;
}) {
  if (!product.image) {
    return (
      <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">
        No image yet
      </span>
    );
  }
  return (
    <Image
      src={product.image.url}
      alt={product.image.altText ?? product.name}
      fill
      sizes={sizes}
      loading={eager ? 'eager' : undefined}
      fetchPriority={eager ? 'high' : undefined}
      className="object-contain"
    />
  );
}

function SideProduct({
  product,
  tagSide,
}: {
  /** Product beside the main one. */
  product: CatalogProduct;
  /** Corner the price tag sits in on desktop, nearest the main product. */
  tagSide: 'left' | 'right';
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="relative flex w-[44%] flex-col items-center sm:block sm:w-[24%]"
    >
      <span className="relative block aspect-square w-full">
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 44vw, 300px"
        />
      </span>
      <span
        className={cn(
          'glass-adaptive mt-2 inline-flex h-9 max-w-full items-center gap-1.5 rounded-control px-2.5 text-[13px] font-medium whitespace-nowrap',
          'sm:absolute sm:-top-2 sm:mt-0 sm:h-10 sm:gap-2.5 sm:px-3.5 sm:text-sm',
          tagSide === 'right' ? 'sm:right-0' : 'sm:left-0',
        )}
      >
        {/* Long names truncate so the tag stays inside its column. */}
        <span className="min-w-0 truncate">{product.name}</span>
        <span className="shrink-0 font-semibold tabular-nums">
          {formatPrice(product.price)}
        </span>
      </span>
    </Link>
  );
}

/** Glass card over the stage's bottom-right corner; sits in the flow on phones. */
function HeroCard({
  product,
}: {
  /** The main hero product. */
  product: CatalogProduct;
}) {
  return (
    <div className="glass-text relative mx-3 -mt-6 mb-3 flex flex-col gap-3.5 rounded-panel p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_18px_44px_rgb(17_18_20/0.12),0_1px_2px_rgb(17_18_20/0.06)] sm:absolute sm:right-10 sm:-bottom-14 sm:m-0 sm:w-[368px]">
      <div className="flex items-center gap-1.5 text-[13px] text-body">
        <span>{product.store.name}</span>
        {product.store.verified && (
          <>
            <SealIcon width={14} height={14} />
            <span className="sr-only">Verified store</span>
          </>
        )}
        {product.rating && product.rating.count > 0 && (
          <>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <StarIcon className="text-ink" />
            <span>
              <span className="font-medium text-ink">
                {product.rating.average.toFixed(1)}
              </span>{' '}
              ({product.rating.count.toLocaleString('en-US')}
              <span className="sr-only"> reviews</span>)
            </span>
          </>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[32px] leading-none tracking-[-0.02em]">
          {product.name}
        </h2>
        <span className="text-lg font-semibold tabular-nums">
          {formatPrice(product.price)}
        </span>
      </div>
      <p className="line-clamp-2 text-sm leading-[1.55] text-body">
        {product.description}
      </p>
      <Link
        href={`/product/${product.id}`}
        className={buttonClasses({ className: 'w-full' })}
      >
        Shop now
      </Link>
    </div>
  );
}
