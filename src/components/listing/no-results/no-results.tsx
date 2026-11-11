import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { colourHex } from '@/lib/colours';
import {
  clearedFilters,
  hasFilters,
  listingHref,
  type ListingFilters,
} from '@/lib/listing';

export type NoResultsProps = {
  /** The filters in the URL. */
  filters: ListingFilters;
};

/**
 * Shown in place of the grid when nothing matches. With filters set it
 * offers to loosen them; with none, the shop itself is empty.
 */
export function NoResults({ filters }: NoResultsProps) {
  if (!hasFilters(filters)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-panel bg-surface px-5 py-12 text-center sm:px-8 sm:py-20">
        <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-0.02em]">
          The shelves are still empty.
        </h2>
        <p className="max-w-[52ch] text-body">
          Products appear here once a store is approved and publishes its first
          item.
        </p>
        <Link href="/sell" className={buttonClasses({ variant: 'secondary' })}>
          Open a store
        </Link>
      </div>
    );
  }

  const swatches = filters.colors
    .map(colourHex)
    .filter((hex): hex is string => Boolean(hex));

  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-panel bg-surface px-5 py-12 text-center sm:px-8 sm:py-20"
    >
      {swatches.length > 0 && (
        <div aria-hidden="true" className="flex">
          {swatches.map((hex) => (
            <span
              key={hex}
              className="-mx-1.5 size-10 rounded-full shadow-[0_0_0_3px_var(--color-surface)]"
              style={{ background: hex }}
            />
          ))}
        </div>
      )}
      <h2 className="mt-2 font-display text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-0.02em]">
        Nothing matches those filters
      </h2>
      <p className="max-w-[52ch] text-body">
        Try removing a filter or two to see more of the shop.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {filters.colors.length > 0 && (
          <Link
            href={listingHref(filters, { colors: [] })}
            scroll={false}
            className={buttonClasses()}
          >
            Clear colour filters
          </Link>
        )}
        <Link
          href={listingHref(filters, clearedFilters)}
          scroll={false}
          className={buttonClasses({ variant: 'ghost' })}
        >
          Clear all filters
        </Link>
      </div>
    </div>
  );
}
