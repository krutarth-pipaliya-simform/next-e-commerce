import { requireRole } from '@/lib/authz';

export default async function SellerProductsPage() {
  await requireRole(['SELLER'], '/seller/products');
  return <div>Seller products page</div>;
}
