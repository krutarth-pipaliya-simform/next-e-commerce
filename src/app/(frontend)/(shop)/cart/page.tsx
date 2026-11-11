import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BagGroup } from '@/components/cart/bag-group';
import { BagUndoProvider } from '@/components/cart/bag-undo';
import { CheckoutBar } from '@/components/cart/checkout-bar';
import { EmptyBag } from '@/components/cart/empty-bag';
import { OrderSummary } from '@/components/cart/order-summary';
import { RemovalToast } from '@/components/cart/removal-toast';
import { ShippingProgress } from '@/components/cart/shipping-progress';
import { UnavailableLines } from '@/components/cart/unavailable-lines';
import { RelatedProducts } from '@/components/product/related-products';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { requireUser } from '@/lib/authz';
import { getBag } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'Your bag',
  robots: { index: false, follow: true },
};

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

export default async function CartPage() {
  // Each user's cart lives in the database, so there is no guest cart.
  const user = await requireUser('/cart');
  const bag = await getBag(user.id);
  const hasLines = bag.groups.length > 0 || bag.unavailable.length > 0;

  return (
    <BagUndoProvider>
      <Container className="pt-10 pb-16 sm:pt-14 sm:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[clamp(40px,6vw,72px)] leading-none tracking-[-0.02em]">
              Your bag
            </h1>
            <p className="text-base text-body">
              {bag.groups.length > 0
                ? `${plural(bag.itemCount, 'item')} from ${plural(bag.groups.length, 'store')}`
                : 'Nothing to check out yet'}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-11 items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
          >
            Continue shopping
            <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>

        <RemovalToast className="mt-6" />

        {hasLines ? (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="flex min-w-0 flex-col gap-4">
              {bag.groups.length > 0 && (
                <ShippingProgress
                  subtotal={bag.subtotal}
                  remaining={bag.freeShippingRemaining}
                />
              )}
              {bag.groups.map((group) => (
                <BagGroup
                  key={group.store.id}
                  group={group}
                  freeShipping={bag.shipping === 0}
                />
              ))}
              <UnavailableLines lines={bag.unavailable} />
            </div>

            <OrderSummary
              itemCount={bag.itemCount}
              storeCount={bag.groups.length}
              subtotal={bag.subtotal}
              shipping={bag.shipping}
              total={bag.total}
              canCheckout={bag.canCheckout}
            />

            <CheckoutBar
              itemCount={bag.itemCount}
              total={bag.total}
              canCheckout={bag.canCheckout}
            />
          </div>
        ) : (
          <EmptyBag className="mt-8" />
        )}

        <div className="mt-16 sm:mt-24">
          <Suspense fallback={<Skeleton className="h-96 rounded-panel" />}>
            <RelatedProducts
              excludeProductIds={bag.productIds}
              categoryIds={bag.categoryIds}
            />
          </Suspense>
        </div>
      </Container>
    </BagUndoProvider>
  );
}
