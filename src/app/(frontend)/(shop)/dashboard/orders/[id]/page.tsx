import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { OrderDetails } from '@/components/orders/order-details';
import { StoreOrderCard } from '@/components/orders/store-order-card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { StatusBadge } from '@/components/ui/status-badge';
import { requireUser } from '@/lib/authz';
import { getPlacedOrder, orderNumber, overallStatus } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Order details',
  robots: { index: false, follow: false },
};

const placedOn = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' });

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/orders/${id}`);

  // Someone else's order id reads as missing, so ids can't be probed.
  const order = await getPlacedOrder(id, user.id);
  if (!order) notFound();

  const parcels = order.storeOrders.length;
  const status = overallStatus(order.storeOrders.map((so) => so.status));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Orders', href: '/dashboard/orders' },
          { label: `#${orderNumber(order.id)}` },
        ]}
      />
      <div className="mt-3">
        <PageHeader
          title={`Order #${order.number}`}
          description={`Placed ${placedOn.format(order.createdAt)} · ${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'} in ${parcels} ${parcels === 1 ? 'parcel' : 'parcels'}`}
          actions={<StatusBadge status={status} />}
        />
      </div>

      <div className="flex flex-col gap-6">
        {order.storeOrders.map((storeOrder, index) => (
          <StoreOrderCard
            key={storeOrder.id}
            storeOrder={storeOrder}
            orderNumber={order.number}
            parcel={index + 1}
            parcelCount={parcels}
            placedAt={order.createdAt}
          />
        ))}
        <OrderDetails order={order} />
      </div>
    </>
  );
}
