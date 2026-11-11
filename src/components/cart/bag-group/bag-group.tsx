import Link from 'next/link';
import { BagLine } from '@/components/cart/bag-line';
import { ChevronRightIcon, TruckIcon } from '@/components/ui/icons';
import type { BagGroup as BagGroupData } from '@/lib/cart';
import { SHIPPING_PER_STORE } from '@/lib/cart-rules';
import { formatPrice, initials } from '@/lib/utils';

export type BagGroupProps = {
  /** One store's lines, from `getBag`. */
  group: BagGroupData;
  /** Whether the order has reached free shipping, which covers every store. */
  freeShipping: boolean;
};

const itemsText = (count: number) =>
  `${count} ${count === 1 ? 'item' : 'items'}`;

/**
 * The lines one store ships, as a white card: the store with a link to it,
 * its delivery charge, the lines, and the store's subtotal.
 */
export function BagGroup({ group, freeShipping }: BagGroupProps) {
  const headingId = `bag-store-${group.store.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-panel bg-surface px-4 py-2 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:px-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-hairline py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 flex-none place-items-center rounded-control bg-ink text-sm font-semibold tracking-[0.02em] text-white"
          >
            {initials(group.store.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13px] text-muted">Ships from</span>
            <h2
              id={headingId}
              className="text-[17px] leading-tight font-semibold"
            >
              <Link
                href={`/stores/${group.store.slug}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                {group.store.name}
                <ChevronRightIcon width={16} height={16} />
              </Link>
            </h2>
          </div>
        </div>
        <p className="flex items-center gap-2.5 text-sm text-body">
          <TruckIcon className="flex-none" />
          Standard delivery ·{' '}
          {freeShipping ? 'Free' : formatPrice(SHIPPING_PER_STORE)}
        </p>
      </header>

      <div className="divide-y divide-hairline">
        {group.lines.map((line) => (
          <BagLine key={line.id} line={line} />
        ))}
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-hairline py-4 text-sm text-body tabular-nums">
        <span>
          {group.store.name} subtotal · {itemsText(group.itemCount)}
        </span>
        <span className="text-base font-semibold text-ink">
          {formatPrice(group.subtotal)}
        </span>
      </footer>
    </section>
  );
}
