import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { CheckIcon, PackageIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import type { PlacedOrder } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';

export type OrderPlacedProps = {
  /** The order just placed, from `getPlacedOrder`. */
  order: PlacedOrder;
  /** The shopper's name; the first word greets them. */
  customerName: string | null;
};

const placedDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/**
 * The confirmation hero: thanks, the order number and payment state, a
 * one-line recap, and links to track the order or keep shopping. A stage
 * beside it lists the parcels the order splits into.
 */
export function OrderPlaced({ order, customerName }: OrderPlacedProps) {
  const firstName = customerName?.trim().split(/\s+/)[0];
  const paid = order.paymentStatus === 'PAID';
  const parcels = order.storeOrders.length;

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col justify-center gap-6 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-12">
        <p className="flex items-center gap-2.5 text-[15px] font-semibold text-stock">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-stock text-white"
          >
            <CheckIcon strokeWidth={2.5} />
          </span>
          Order placed
        </p>
        <h1 className="font-display text-[clamp(52px,8vw,88px)] leading-[0.95] tracking-[-0.02em]">
          Thank you{firstName ? ', ' : ''}
          {firstName && <em>{firstName}</em>}.
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <span className="text-xl font-semibold tabular-nums">
            Order #{order.number}
          </span>
          <StatusBadge status={paid ? 'PAID' : 'PENDING'} />
        </div>
        <p className="max-w-[520px] text-base leading-relaxed text-body">
          {paid
            ? 'Your payment went through. '
            : 'You’ll pay each store’s courier when its parcel arrives. '}
          {parcels > 1
            ? 'Each store packs and ships its own parcel, and you can follow every one from your account.'
            : 'You can follow your parcel from your account.'}
        </p>
        <p className="text-sm text-muted tabular-nums">
          Placed {placedDate.format(order.createdAt)} ·{' '}
          {plural(order.itemCount, 'item')} from {plural(parcels, 'store')} ·{' '}
          {paid ? 'Total paid' : 'Total to pay'} {formatPrice(order.total)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className={buttonClasses({ className: 'h-13 px-6' })}
          >
            <PackageIcon width={18} height={18} />
            Track order
          </Link>
          <Link
            href="/products"
            className={buttonClasses({
              variant: 'secondary',
              className: 'h-13 px-6',
            })}
          >
            Continue shopping
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="stage flex min-h-[220px] flex-[1_1_320px] flex-col items-center justify-center gap-3 rounded-panel p-8 shadow-[inset_0_0_0_1px_var(--color-hairline)]"
      >
        {order.storeOrders.map((storeOrder, index) => (
          <span
            key={storeOrder.id}
            className="glass-chrome flex h-12 items-center gap-2.5 rounded-control px-4 text-sm font-semibold"
          >
            <PackageIcon width={18} height={18} />
            {parcels > 1 && `Parcel ${index + 1} · `}
            {storeOrder.store.name}
          </span>
        ))}
      </div>
    </div>
  );
}
