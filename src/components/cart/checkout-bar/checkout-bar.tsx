import Link from 'next/link';
import { checkoutButtonClasses } from '@/components/cart/order-summary';
import { LockIcon } from '@/components/ui/icons';
import { cn, formatPrice } from '@/lib/utils';

export type CheckoutBarProps = {
  /** Items that can be bought (summed quantities). */
  itemCount: number;
  /** In rupees. */
  total: number;
  /** Shows Checkout when true; otherwise the summary explains what to fix. */
  canCheckout: boolean;
};

/**
 * Phones only: a glass bar with the total and Checkout that sticks to the
 * bottom of the screen while the bag scrolls, since the summary sits below it.
 */
export function CheckoutBar({
  itemCount,
  total,
  canCheckout,
}: CheckoutBarProps) {
  if (!canCheckout) return null;
  return (
    <div className="glass-chrome sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-control py-2 pr-2 pl-4 sm:hidden">
      <span className="flex flex-col tabular-nums">
        <span className="text-xs text-body">
          Total · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <span className="text-lg font-semibold">{formatPrice(total)}</span>
      </span>
      <Link href="/checkout" className={cn(checkoutButtonClasses, 'h-12 px-6')}>
        <LockIcon width={18} height={18} />
        Checkout
      </Link>
    </div>
  );
}
