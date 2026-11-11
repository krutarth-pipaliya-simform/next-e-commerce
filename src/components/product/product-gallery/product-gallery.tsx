'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type ProductGalleryProps = {
  /** Product name, used for alt text when an image has none. */
  productName: string;
  /** The product's images, primary first. */
  images: { id: string; url: string; altText: string | null }[];
};

/**
 * The product page's image viewer: a large studio stage, a rail of
 * thumbnails (beside the stage on desktop, under it on phones) and
 * previous/next controls. With one image only the stage shows.
 */
export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index];
  const altFor = (image: (typeof images)[number], i: number) =>
    image.altText ?? `${productName}, image ${i + 1} of ${count}`;

  const step = (by: number) => setIndex((i) => (i + by + count) % count);

  return (
    <section
      aria-label="Product images"
      className="flex min-w-0 flex-col-reverse gap-3 lg:flex-row lg:items-start lg:gap-4"
    >
      {count > 1 && (
        <div
          role="group"
          aria-label="Choose an image"
          className="-mx-4 flex gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:px-1 lg:flex-col lg:overflow-visible"
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'stage relative size-18 flex-none overflow-hidden rounded-[10px] transition-shadow lg:size-22',
                i === index
                  ? 'shadow-[0_0_0_2px_var(--color-ground),0_0_0_4px_var(--color-ink)]'
                  : 'shadow-[inset_0_0_0_1px_var(--color-hairline)] hover:shadow-[0_0_0_2px_var(--color-ground),0_0_0_3px_var(--color-divider)]',
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="88px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      <div className="stage relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-panel shadow-[0_0_0_1px_var(--color-hairline)] sm:aspect-square lg:aspect-auto lg:h-[680px]">
        {current ? (
          <Image
            key={current.id}
            src={current.url}
            alt={altFor(current, index)}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-contain p-10 sm:p-16"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            No image yet
          </span>
        )}

        {count > 1 && (
          <div className="glass-adaptive absolute bottom-4 left-1/2 flex h-13 -translate-x-1/2 items-center gap-1 rounded-control px-1">
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="grid size-11 place-items-center rounded-control text-ink hover:bg-white/60"
            >
              <ChevronLeftIcon />
            </button>
            <span
              aria-live="polite"
              className="min-w-16 text-center text-sm font-medium text-ink tabular-nums"
            >
              {index + 1}{' '}
              <span className="font-normal text-body">of {count}</span>
            </span>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="grid size-11 place-items-center rounded-control text-ink hover:bg-white/60"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
