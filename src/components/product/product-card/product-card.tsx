import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { SealIcon } from '@/components/ui/icons';
import { Rating } from '@/components/product/rating';
import { formatPrice } from '@/lib/utils';
import type { ProductCardProps } from './product-card.types';

/**
 * Shared product card: white card, studio-sweep stage with the product
 * image, glass controls over the image, then name, store, price, rating.
 * Quick add shows on hover with a mouse and is always visible on touch.
 */
export function ProductCard({
  id,
  name,
  price,
  image,
  store,
  rating,
  tint,
  label,
  quickAdd,
  saveButton,
}: ProductCardProps) {
  const href = `/product/${id}`;

  return (
    <article
      className="group relative flex flex-col gap-3 rounded-card border border-hairline bg-surface p-3"
      style={tint ? ({ '--tint': tint } as CSSProperties) : undefined}
    >
      <div className="stage relative aspect-[4/5] overflow-hidden rounded-stage">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            No image yet
          </span>
        )}

        {label && (
          <span className="glass-adaptive absolute top-3 left-3 rounded-chip px-2.5 py-1 text-xs font-semibold text-ink">
            {label}
          </span>
        )}
        {saveButton && (
          <div className="absolute top-2 right-2 z-10">{saveButton}</div>
        )}
        {quickAdd && (
          <div className="absolute inset-x-3 bottom-3 z-10 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
            {quickAdd}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="text-sm font-medium text-ink sm:text-[15px]">
          {/* The stretched link makes the whole card clickable; buttons sit above it with z-10. */}
          <Link href={href} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>
        <Link
          href={`/stores/${store.slug}`}
          className="relative z-10 inline-flex w-fit items-center gap-1 text-[13px] text-body hover:text-ink"
        >
          {store.name}
          {store.verified && (
            <>
              <SealIcon width={14} height={14} />
              <span className="sr-only">Verified store</span>
            </>
          )}
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="font-semibold tabular-nums">
            {formatPrice(price)}
          </span>
          {rating && rating.count > 0 && <Rating {...rating} />}
        </div>
      </div>
    </article>
  );
}
