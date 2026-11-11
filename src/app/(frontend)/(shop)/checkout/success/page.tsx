import { requireUser } from '@/lib/authz';

export default async function CheckoutSuccessPage() {
  await requireUser('/checkout/success');
  return <div>Checkout Success Page</div>;
}
