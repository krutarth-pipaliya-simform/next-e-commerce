import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { OrderPlaced } from '@/components/checkout/order-placed';
import { OrderDetails } from '@/components/orders/order-details';
import { StoreOrderCard } from '@/components/orders/store-order-card';
import { RelatedProducts } from '@/components/product/related-products';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { requireUser } from '@/lib/authz';
import { getPlacedOrder } from '@/lib/orders';

export const metadata: Metadata = {
  title: 'Order placed',
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const { order: orderParam } = await searchParams;
  const orderId = typeof orderParam === 'string' ? orderParam : undefined;
  const user = await requireUser(
    orderId
      ? `/checkout/success?order=${encodeURIComponent(orderId)}`
      : '/dashboard/orders',
  );
  if (!orderId) redirect('/dashboard/orders');

  // Someone else's order id reads as missing, so ids can't be probed.
  const order = await getPlacedOrder(orderId, user.id);
  if (!order) notFound();

  const parcels = order.storeOrders.length;

  return (
    <Container className="pt-10 pb-16 sm:pt-12 sm:pb-24">
      <section aria-label="Order confirmation">
        <OrderPlaced order={order} customerName={user.name} />
      </section>

      <section aria-labelledby="order-split" className="mt-16 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-3">
          <h2
            id="order-split"
            className="font-display text-[clamp(36px,5vw,48px)] leading-none tracking-[-0.02em]"
          >
            {parcels > 1 ? (
              <>
                Your order ships in <em>{parcels}</em> parts
              </>
            ) : (
              <>
                Your order ships in <em>one</em> parcel
              </>
            )}
          </h2>
          <p className="max-w-[560px] flex-[0_1_560px] text-[15px] leading-relaxed text-body">
            Daylight is a marketplace of independent stores. You paid once for #
            {order.number}
            {parcels > 1
              ? '; each store packs and ships its own parcel, so they may arrive on different days.'
              : ', and the store packs and ships it to you.'}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,520px),1fr))] gap-6">
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
        </div>
      </section>

      <OrderDetails order={order} className="mt-6" />

      <div className="mt-16 sm:mt-24">
        <Suspense fallback={<Skeleton className="h-96 rounded-panel" />}>
          <RelatedProducts
            excludeProductIds={order.productIds}
            categoryIds={order.categoryIds}
          />
        </Suspense>
      </div>
    </Container>
  );
}
