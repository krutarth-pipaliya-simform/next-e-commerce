import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderStatus } from '@/generated/prisma/enums';
import { DELIVERY_LABEL, deliveryWindow } from '@/lib/cart-rules';
import type { PlacedStoreOrder } from '@/lib/orders';
import { cn, formatPrice, initials } from '@/lib/utils';

export type StoreOrderCardProps = {
  /** One store's part of the order, from `getPlacedOrder`. */
  storeOrder: PlacedStoreOrder;
  /** The parent order's number, e.g. "DL-7Q2K9X". */
  orderNumber: string;
  /** Position among the order's parcels, from 1. */
  parcel: number;
  /** How many parcels the order ships in. */
  parcelCount: number;
  /** When the order was placed, for the arrival estimate. */
  placedAt: Date;
};

const steps = [
  { label: 'Placed', note: 'The store is packing it' },
  { label: 'Shipped', note: 'On its way to you' },
  { label: 'Delivered', note: 'Then rate the store' },
];

/** How far along the steps a status is, or -1 for a cancelled order. */
const progress: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 0,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELLED: -1,
};

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/**
 * One store's parcel of an order: the store, its status, the items, a
 * Placed → Shipped → Delivered tracker and the delivery details.
 */
export function StoreOrderCard({
  storeOrder,
  orderNumber,
  parcel,
  parcelCount,
  placedAt,
}: StoreOrderCardProps) {
  const headingId = `store-order-${storeOrder.id}`;
  const reached = progress[storeOrder.status];
  const fee =
    storeOrder.shippingFee === 0 ? 'free' : formatPrice(storeOrder.shippingFee);

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-panel bg-surface p-5 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-12 flex-none place-items-center rounded-control bg-ink text-sm font-semibold tracking-[0.02em] text-white"
          >
            {initials(storeOrder.store.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3
              id={headingId}
              className="text-[17px] leading-tight font-semibold"
            >
              <Link
                href={`/stores/${storeOrder.store.slug}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                {storeOrder.store.name}
                <ChevronRightIcon width={16} height={16} />
              </Link>
            </h3>
            <span className="text-[13px] text-muted tabular-nums">
              Store order{' '}
              <span className="font-medium text-ink">
                #{orderNumber}-{parcel}
              </span>
              {parcelCount > 1 && ` · Parcel ${parcel} of ${parcelCount}`}
            </span>
          </div>
        </div>
        <StatusBadge status={storeOrder.status} />
      </div>

      <div className="flex flex-col gap-3">
        {storeOrder.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="stage relative h-21 w-18 flex-none overflow-hidden rounded-stage shadow-[inset_0_0_0_1px_var(--color-hairline)]"
            >
              {item.image && (
                <Image
                  src={item.image.url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain p-2"
                />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {item.productId ? (
                <Link
                  href={`/product/${item.productId}`}
                  className="text-[15px] font-medium hover:underline"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-[15px] font-medium">{item.name}</span>
              )}
              <span className="text-[13px] text-muted">
                {[item.options, `Qty ${item.quantity}`]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
            <span className="text-[15px] font-semibold tabular-nums">
              {formatPrice(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      {reached >= 0 && (
        <ol aria-label="Delivery progress" className="grid grid-cols-3 gap-2">
          {steps.map((step, index) => {
            const done = index <= reached;
            return (
              <li
                key={step.label}
                aria-current={index === reached ? 'step' : undefined}
                className="flex flex-col gap-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1 rounded-full',
                    done ? 'bg-ink' : 'bg-sunken',
                  )}
                />
                <span className="flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      done ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {step.label}
                    <span className="sr-only">
                      {done ? ', done' : ', not yet'}
                    </span>
                  </span>
                  <span className="text-xs text-muted">{step.note}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-4 gap-y-3 border-t border-hairline pt-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] text-muted">Estimated arrival</dt>
          <dd className="font-medium">
            {deliveryWindow(storeOrder.deliverySpeed, placedAt)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] text-muted">Delivery</dt>
          <dd className="font-medium">
            {DELIVERY_LABEL[storeOrder.deliverySpeed]}, {fee}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] text-muted">
            Store subtotal ({plural(storeOrder.itemCount, 'item')})
          </dt>
          <dd className="font-semibold tabular-nums">
            {formatPrice(storeOrder.subtotal)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
