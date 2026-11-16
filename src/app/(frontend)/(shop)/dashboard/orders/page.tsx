import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OrderRow } from '@/components/orders/order-row';
import { PageHeader } from '@/components/layout/page-header';
import { buttonClasses } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { requireUser } from '@/lib/authz';
import { getOrderHistory, ORDERS_PAGE_SIZE } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Your orders',
  robots: { index: false, follow: false },
};

const ordersHref = (page: number) =>
  page > 1 ? `/dashboard/orders?page=${page}` : '/dashboard/orders';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: pageParam } = await searchParams;
  const requested = Number(typeof pageParam === 'string' ? pageParam : 1);
  const page = Number.isInteger(requested) && requested > 1 ? requested : 1;

  const user = await requireUser(ordersHref(page));
  const history = await getOrderHistory(user.id, page);

  // A page past the end (e.g. an old bookmark) goes to the last real page.
  if (history.total > 0 && history.page !== page) {
    redirect(ordersHref(history.page));
  }

  return (
    <>
      <PageHeader
        title="Your orders"
        description={
          history.total > 0
            ? `${history.total.toLocaleString('en-IN')} ${history.total === 1 ? 'order' : 'orders'}, newest first`
            : 'Nothing ordered yet'
        }
      />

      {history.total === 0 ? (
        <section
          aria-labelledby="no-orders"
          className="flex flex-col items-start gap-4 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-10"
        >
          <h2
            id="no-orders"
            className="font-display text-[clamp(28px,4vw,40px)] leading-none tracking-[-0.02em]"
          >
            No orders <em>yet</em>
          </h2>
          <p className="max-w-[46ch] text-base leading-[1.6] text-body">
            When you place an order, it shows up here with a tracker for each
            store’s parcel.
          </p>
          <Link href="/products" className={buttonClasses()}>
            Start shopping
          </Link>
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          {history.orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
          <Pagination
            page={history.page}
            pageCount={history.pageCount}
            total={history.total}
            pageSize={ORDERS_PAGE_SIZE}
            hrefFor={ordersHref}
          />
        </div>
      )}
    </>
  );
}
