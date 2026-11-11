import { CardIcon, CashIcon, InfoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import type { PlacedOrder } from '@/lib/orders';
import { cn, formatPrice } from '@/lib/utils';

export type OrderDetailsProps = {
  /** The order, from `getPlacedOrder`. */
  order: PlacedOrder;
  /** Extra classes for the grid. */
  className?: string;
};

const cardClasses =
  'flex flex-col gap-4 rounded-panel bg-surface p-5 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-7';
const headingClasses =
  'font-display text-[32px] leading-none tracking-[-0.02em]';

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/** Two cards: the address the parcels go to, and how the order was paid. */
export function OrderDetails({ order, className }: OrderDetailsProps) {
  const { shipTo } = order;
  const paid = order.paymentStatus === 'PAID';
  const parcels = order.storeOrders.length;

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      <section aria-labelledby="delivering-to" className={cardClasses}>
        <h2 id="delivering-to" className={headingClasses}>
          Delivering to
        </h2>
        <address className="text-[15px] leading-relaxed text-body not-italic">
          <span className="font-semibold text-ink">{shipTo.name}</span>
          <br />
          {shipTo.street}
          <br />
          {shipTo.city}, {shipTo.state} {shipTo.zipCode}, {shipTo.country}
          <br />
          {shipTo.phone}
        </address>
        <p className="mt-auto flex items-start gap-2 rounded-control bg-ground px-3.5 py-3 text-[13px] leading-normal text-body">
          <InfoIcon width={16} height={16} className="mt-0.5 flex-none" />
          Saved with this order. Editing your address book won’t change where
          these parcels go.
        </p>
      </section>

      <section aria-labelledby="payment-details" className={cardClasses}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="payment-details" className={headingClasses}>
            Payment
          </h2>
          <StatusBadge status={paid ? 'PAID' : 'PENDING'} />
        </div>
        <p className="flex items-center gap-2.5 text-[15px]">
          {order.paymentMethod === 'CARD' ? (
            <>
              <CardIcon className="text-muted" />
              Card ending {order.cardLast4}
            </>
          ) : (
            <>
              <CashIcon className="text-muted" />
              Pay on delivery
              <span className="text-[13px] text-muted">
                · each courier collects its share
              </span>
            </>
          )}
        </p>
        <dl className="flex flex-col gap-2 text-sm tabular-nums">
          <div className="flex justify-between gap-3">
            <dt className="text-body">
              Subtotal ({plural(order.itemCount, 'item')})
            </dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-body">
              Shipping · {plural(parcels, 'parcel')}
            </dt>
            <dd className={cn(order.shippingTotal === 0 && 'text-stock')}>
              {order.shippingTotal === 0
                ? 'Free'
                : formatPrice(order.shippingTotal)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-hairline pt-2.5 text-[15px] font-semibold">
            <dt>{paid ? 'Total paid' : 'Total to pay'}</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <p className="text-[13px] text-muted">
          Prices include GST. Payments are simulated; no real charge was made.
        </p>
      </section>
    </div>
  );
}
