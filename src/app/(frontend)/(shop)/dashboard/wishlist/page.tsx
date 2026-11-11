import { requireUser } from '@/lib/authz';

export default async function WishlistPage() {
  await requireUser('/dashboard/wishlist');
  return <div>Wishlist page</div>;
}
