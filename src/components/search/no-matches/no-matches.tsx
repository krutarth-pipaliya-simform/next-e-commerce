import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { CheckIcon, SearchIcon } from '@/components/ui/icons';
import { listingHref } from '@/lib/listing';

export type NoMatchesProps = {
  /** The search text that found nothing. */
  q: string;
};

/** A search for `q` with no filters. */
function searchHref(q: string) {
  return listingHref({ q, colors: [], sort: 'featured', page: 1 });
}

/**
 * Shown when a search finds nothing at all, before any filter: what
 * usually helps, and ways back into the shop.
 */
export function NoMatches({ q }: NoMatchesProps) {
  const words = q.split(' ');
  // Dropping the last word is the usual fix ("purple kettle xl" → "purple kettle").
  const shorter = words.length > 1 ? words.slice(0, -1).join(' ') : undefined;

  return (
    <div
      role="status"
      className="flex flex-col gap-5 rounded-panel bg-surface p-6 sm:p-12"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-control bg-sunken"
      >
        <SearchIcon width={24} height={24} />
      </span>
      <h2 className="font-display text-[clamp(36px,4vw,48px)] leading-[1.02] tracking-[-0.02em] [overflow-wrap:anywhere]">
        Nothing matched “{q}”
      </h2>
      <p className="leading-relaxed text-body">
        A few things that usually help:
      </p>
      <ul className="flex flex-col gap-3 text-[15px] leading-normal">
        {shorter && (
          <li className="flex gap-3">
            <CheckIcon className="mt-0.5 flex-none text-muted" />
            <span>
              Use fewer words. Sizes are picked on the product page, so try{' '}
              <Link
                href={searchHref(shorter)}
                className="font-medium text-accent hover:underline hover:underline-offset-3"
              >
                {shorter}
              </Link>
              .
            </span>
          </li>
        )}
        <li className="flex gap-3">
          <CheckIcon className="mt-0.5 flex-none text-muted" />
          <span>
            Search by colour name. Sellers often use names like Cobalt or Lilac
            rather than blue or purple.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckIcon className="mt-0.5 flex-none text-muted" />
          <span>Check the spelling, or browse a category instead.</span>
        </li>
      </ul>
      <div className="mt-1 flex flex-wrap gap-2">
        <Link href="/products" className={buttonClasses()}>
          Browse all products
        </Link>
        {shorter && (
          <Link
            href={searchHref(shorter)}
            className={buttonClasses({ variant: 'ghost' })}
          >
            Search “{shorter}”
          </Link>
        )}
      </div>
    </div>
  );
}
