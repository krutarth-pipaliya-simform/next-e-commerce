import Link from 'next/link';
import type { DeliverySpeed } from '@/generated/prisma/enums';
import { checkoutButtonClasses } from '@/components/cart/order-summary';
import { LockIcon } from '@/components/ui/icons';
import type { BagGroup } from '@/lib/cart';
import { DELIVERY_LABEL } from '@/lib/cart-rules';
import { cn, formatPrice } from '@/lib/utils';
import { feeText } from './delivery-section';
import { LineThumb } from './line-thumb';

export type Parcel = {
  group: BagGroup;
  speed: DeliverySpeed;
  /** In rupees. */
  fee: number;
};

type CheckoutSummaryProps = {
  parcels: Parcel[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  deliveryWindows: Record<DeliverySpeed, string>;
  pending: boolean;
};

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/** The submit button's content: a spinner while the order is placed. */
export function PlaceOrderLabel({ pending }: { pending: boolean }) {
  return pending ? (
    <>
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
      />
      Placing order…
    </>
  ) : (
    <>
      <LockIcon width={18} height={18} />
      Place order
    </>
  );
}

export const placeOrderClasses = cn(
  checkoutButtonClasses,
  'disabled:cursor-progress disabled:bg-ink-hover',
);

/**
 * The glass summary beside the form: each parcel with its lines and the
 * delivery picked for it, the totals and Place order. Sticky on wide screens.
 */
export function CheckoutSummary({
  parcels,
  itemCount,
  subtotal,
  shipping,
  total,
  deliveryWindows,
  pending,
}: CheckoutSummaryProps) {
  return (
    <aside
      aria-labelledby="checkout-summary"
      className="glass-text flex flex-col gap-4 rounded-panel p-5 sm:p-6 lg:sticky lg:top-28"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="checkout-summary"
          className="font-display text-[32px] leading-none tracking-[-0.02em]"
        >
          Order summary
        </h2>
        <Link
          href="/cart"
          className="inline-flex h-11 items-center text-sm font-medium text-accent hover:underline"
        >
          Edit bag
        </Link>
      </div>

      {parcels.map(({ group, speed, fee }, index) => (
        <div
          key={group.store.id}
          className="flex flex-col gap-3 rounded-control bg-surface p-4 shadow-[0_0_0_1px_var(--color-hairline)]"
        >
          <span className="flex justify-between gap-2 text-[13px] font-medium text-body tabular-nums">
            <span>
              {parcels.length > 1 && `Parcel ${index + 1} · `}
              {group.store.name}
            </span>
            <span>{formatPrice(group.subtotal)}</span>
          </span>
          {group.lines.map((line) => (
            <LineThumb key={line.id} line={line} size="sm" />
          ))}
          <span className="flex justify-between gap-2 text-[13px] text-muted tabular-nums">
            <span>
              {DELIVERY_LABEL[speed]} · {deliveryWindows[speed]}
            </span>
            <span className="font-medium text-ink">{feeText(fee)}</span>
          </span>
        </div>
      ))}

      <dl className="flex flex-col gap-2.5 text-[15px] tabular-nums">
        <div className="flex justify-between gap-3">
          <dt className="text-body">Subtotal ({plural(itemCount, 'item')})</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-body">
            Shipping{' '}
            <span className="text-[13px] text-muted">
              · {plural(parcels.length, 'parcel')}
            </span>
          </dt>
          <dd className={cn('font-medium', shipping === 0 && 'text-stock')}>
            {feeText(shipping)}
          </dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between gap-3 border-t border-divider pt-3.5 tabular-nums">
        <span className="text-base font-semibold">Total</span>
        <span
          aria-live="polite"
          className="text-[30px] font-semibold tracking-[-0.01em]"
        >
          {formatPrice(total)}
        </span>
      </div>
      <p className="-mt-2.5 text-[13px] text-muted">Prices include GST.</p>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={cn(placeOrderClasses, 'h-14 text-base')}
      >
        <PlaceOrderLabel pending={pending} />
      </button>
      <p className="text-xs leading-normal text-muted">
        By placing your order you agree to Daylight’s terms and each store’s
        return policy. Payments are simulated; no real charge is made.
      </p>
    </aside>
  );
}
