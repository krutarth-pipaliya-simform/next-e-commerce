import { requireRole } from '@/lib/authz';

export default async function SellerCouponsPage() {
  await requireRole(['SELLER'], '/seller/coupons');
  return <div>Seller coupons page</div>;
}
