import { requireUser } from '@/lib/authz';

export default async function CartPage() {
  // Each user's cart lives in the database, so there is no guest cart.
  await requireUser('/cart');
  return <div>Cart Page</div>;
}
