import { requireUser } from '@/lib/authz';

export default async function CheckoutPage() {
  await requireUser('/checkout');
  return <div>Checkout Page</div>;
}
