import type { CSSProperties } from 'react';
import { CheckIcon, TruckIcon } from '@/components/ui/icons';
import { FREE_SHIPPING_MIN } from '@/lib/cart-rules';
import { cn, formatPrice } from '@/lib/utils';

export type ShippingProgressProps = {
  /** The bag's subtotal in rupees. */
  subtotal: number;
  /** How much more to spend for free shipping; 0 once it's reached. */
  remaining: number;
};

/** A bar filling towards free shipping, which counts every store in the order. */
export function ShippingProgress({
  subtotal,
  remaining,
}: ShippingProgressProps) {
  const done = remaining <= 0;
  const percent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_MIN) * 100),
  );

  return (
    <div className="flex flex-col gap-3 rounded-panel bg-surface px-4 py-4 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5">
        <p className="flex items-center gap-2.5 text-[15px] font-medium">
          {done ? (
            <span
              aria-hidden="true"
              className="grid size-6 flex-none place-items-center rounded-full bg-stock text-white"
            >
              <CheckIcon width={14} height={14} strokeWidth={2.5} />
            </span>
          ) : (
            <TruckIcon className="flex-none" />
          )}
          {done
            ? 'Your order ships free'
            : `Add ${formatPrice(remaining)} more for free shipping`}
        </p>
        <span className="text-[13px] text-muted">
          Free shipping over {formatPrice(FREE_SHIPPING_MIN)}, across every
          store
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-chip bg-sunken"
      >
        <span
          className={cn(
            'block h-full w-(--progress) rounded-chip transition-[width] duration-300 motion-reduce:transition-none',
            done ? 'bg-stock' : 'bg-ink',
          )}
          style={{ '--progress': `${percent}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
