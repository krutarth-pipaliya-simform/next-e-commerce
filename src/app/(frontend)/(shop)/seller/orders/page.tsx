import { requireRole } from '@/lib/authz';

export default async function SellerOrdersPage() {
  await requireRole(['SELLER'], '/seller/orders');
  return <div>Seller orders page</div>;
}
