import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderSummary } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';

export type OrderRowProps = {
  /** The order to summarise, from `getOrderHistory`. */
  order: OrderSummary;
};

const placedOn = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/** One order in the history list: photos, number, date, total and status, linking to the order. */
export function OrderRow({ order }: OrderRowProps) {
  const headingId = `order-${order.id}`;
  const more = order.itemCount - 1;

  return (
    <article
      aria-labelledby={headingId}
      className="relative flex flex-wrap items-center gap-x-6 gap-y-4 rounded-panel bg-surface p-5 shadow-[0_1px_2px_rgb(17_18_20/0.04)] transition-shadow focus-within:ring-2 focus-within:ring-accent hover:shadow-[0_4px_16px_rgb(17_18_20/0.08)] sm:p-6"
    >
      <div aria-hidden="true" className="flex flex-none -space-x-3">
        {order.images.length > 0 ? (
          order.images.map((image, index) => (
            <span
              key={`${image.url}-${index}`}
              className="stage relative size-16 flex-none overflow-hidden rounded-stage shadow-[0_0_0_2px_var(--color-surface),inset_0_0_0_1px_var(--color-hairline)]"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </span>
          ))
        ) : (
          <span className="stage size-16 rounded-stage" />
        )}
      </div>

      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
        <h2 id={headingId} className="text-[17px] leading-tight font-semibold">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none"
          >
            Order #{order.number}
          </Link>
        </h2>
        <p className="truncate text-[15px] text-body">
          {order.firstItemName}
          {more > 0 && ` and ${more} more`}
        </p>
        <p className="text-[13px] text-muted tabular-nums">
          Placed {placedOn.format(order.createdAt)} ·{' '}
          {plural(order.itemCount, 'item')} from{' '}
          {plural(order.storeCount, 'store')}
        </p>
      </div>

      <div className="flex flex-none flex-col items-start gap-2 sm:items-end">
        <StatusBadge status={order.status} />
        <p className="text-[17px] font-semibold tabular-nums">
          {formatPrice(order.total)}
        </p>
      </div>

      <ChevronRightIcon
        aria-hidden="true"
        width={20}
        height={20}
        className="hidden flex-none text-muted sm:block"
      />
    </article>
  );
}
