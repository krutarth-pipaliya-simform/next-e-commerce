import Link from 'next/link';
import {
  LockIcon,
  ReturnIcon,
  SealIcon,
  ShieldIcon,
} from '@/components/ui/icons';
import { cn, formatPrice } from '@/lib/utils';

export type OrderSummaryProps = {
  /** Items that can be bought (summed quantities). */
  itemCount: number;
  /** How many stores ship them, one parcel each. */
  storeCount: number;
  /** In rupees. */
  subtotal: number;
  /** In rupees; 0 means free. */
  shipping: number;
  /** In rupees. */
  total: number;
  /** False while nothing can be bought or a line holds more than is in stock. */
  canCheckout: boolean;
};

/** Shared with the phone checkout bar, so both Checkout buttons match. */
export const checkoutButtonClasses =
  'flex items-center justify-center gap-2.5 rounded-control bg-ink font-semibold text-white transition-colors hover:bg-ink-hover';

function checkoutBlockedReason(itemCount: number) {
  return itemCount === 0
    ? 'Nothing in your bag can be bought right now.'
    : 'Lower the quantities marked in your bag to check out.';
}

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/**
 * The glass summary beside the bag: subtotal, shipping per parcel, total
 * and Checkout. Sticky beside the bag on wide screens.
 */
export function OrderSummary({
  itemCount,
  storeCount,
  subtotal,
  shipping,
  total,
  canCheckout,
}: OrderSummaryProps) {
  return (
    <aside
      aria-labelledby="order-summary"
      className="glass-text flex flex-col gap-5 rounded-panel p-5 sm:p-7 lg:sticky lg:top-28"
    >
      <h2
        id="order-summary"
        className="font-display text-4xl leading-none tracking-[-0.02em]"
      >
        Order summary
      </h2>

      <dl className="flex flex-col gap-3 text-[15px] tabular-nums">
        <div className="flex justify-between gap-3">
          <dt className="text-body">Subtotal ({plural(itemCount, 'item')})</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-body">
            Shipping{' '}
            {storeCount > 0 && (
              <span className="text-[13px] text-muted">
                · {plural(storeCount, 'parcel')}
              </span>
            )}
          </dt>
          <dd className={cn('font-medium', shipping === 0 && 'text-stock')}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between gap-3 border-t border-divider pt-4 tabular-nums">
        <span className="text-base font-semibold">Total</span>
        <span className="text-[30px] font-semibold tracking-[-0.01em]">
          {formatPrice(total)}
        </span>
      </div>
      <p className="-mt-3 text-[13px] leading-[1.45] text-muted">
        Prices include GST. You pay once; each store ships its own parcel.
      </p>

      {canCheckout ? (
        <Link href="/checkout" className={cn(checkoutButtonClasses, 'h-14')}>
          <LockIcon />
          Checkout
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled
            aria-describedby="checkout-blocked"
            className={cn(
              checkoutButtonClasses,
              'h-14 disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <LockIcon />
            Checkout
          </button>
          <p id="checkout-blocked" className="text-[13px] text-sale">
            {checkoutBlockedReason(itemCount)}
          </p>
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 text-center text-xs leading-[1.35] text-body">
        <li className="flex flex-col items-center gap-1.5">
          <ShieldIcon />
          Secure checkout
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <ReturnIcon />
          Free 30-day returns
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <SealIcon />
          Verified stores
        </li>
      </ul>
    </aside>
  );
}
