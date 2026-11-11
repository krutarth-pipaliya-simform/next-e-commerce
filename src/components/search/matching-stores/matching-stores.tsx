import Link from 'next/link';
import { SealIcon } from '@/components/ui/icons';
import type { SearchStore } from '@/lib/catalog';
import { initials } from '@/lib/utils';

export type MatchingStoresProps = {
  /** Stores to show. The section is hidden when empty. */
  stores: SearchStore[];
};

/** "Matching stores": cards for the stores a search turned up. */
export function MatchingStores({ stores }: MatchingStoresProps) {
  if (stores.length === 0) return null;

  return (
    <section aria-labelledby="matching-stores-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="matching-stores-heading"
          className="font-display text-[32px] leading-none tracking-[-0.02em] sm:text-[40px]"
        >
          Matching stores
        </h2>
        <Link
          href="/stores"
          className="inline-flex h-11 items-center text-[15px] font-medium text-accent"
        >
          All stores
        </Link>
      </div>
      <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
        {stores.map((store) => (
          <li key={store.slug}>
            <Link
              href={`/stores/${store.slug}`}
              className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-3.5 transition-colors hover:border-divider"
            >
              <span
                aria-hidden="true"
                className="grid size-14 flex-none place-items-center rounded-control bg-ink font-display text-[26px] leading-none text-white"
              >
                {initials(store.name)}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                {/* Only approved stores are searched, and approval is the verification step. */}
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{store.name}</span>
                  <SealIcon width={16} height={16} />
                  <span className="sr-only">Verified store</span>
                </span>
                <span className="text-[13px] text-body">
                  {store.matchCount > 0
                    ? `${store.matchCount.toLocaleString('en-IN')} matching ${
                        store.matchCount === 1 ? 'product' : 'products'
                      }`
                    : 'Store name matches your search'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
