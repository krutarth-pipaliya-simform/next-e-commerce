import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Container } from '@/components/ui/container';
import { requireUser } from '@/lib/authz';
import { getBag } from '@/lib/cart';
import { deliveryWindow } from '@/lib/cart-rules';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

export default async function CheckoutPage() {
  const user = await requireUser('/checkout');
  const [bag, addresses] = await Promise.all([
    getBag(user.id),
    db.address.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        label: true,
        fullName: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        isDefault: true,
      },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    }),
  ]);

  // The bag explains what's blocking checkout (empty, or over the stock).
  if (!bag.canCheckout) redirect('/cart');

  const now = new Date();
  const storeCount = bag.groups.length;

  return (
    <>
      <Container className="pt-10 sm:pt-12">
        <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-none tracking-[-0.02em]">
          Checkout
        </h1>
        <p className="mt-2.5 text-base text-body">
          {user.email && (
            <>
              Signed in as{' '}
              <span className="font-medium text-ink">{user.email}</span> ·{' '}
            </>
          )}
          {plural(bag.itemCount, 'item')} from {plural(storeCount, 'store')},
          one payment.
        </p>
      </Container>
      <Container className="pt-8">
        <CheckoutForm
          addresses={addresses}
          groups={bag.groups}
          itemCount={bag.itemCount}
          subtotal={bag.subtotal}
          deliveryWindows={{
            STANDARD: deliveryWindow('STANDARD', now),
            EXPRESS: deliveryWindow('EXPRESS', now),
          }}
        />
      </Container>
    </>
  );
}
