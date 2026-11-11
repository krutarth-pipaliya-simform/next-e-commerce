import { requireRole } from '@/lib/authz';

export default async function SellerOverviewPage() {
  await requireRole(['SELLER'], '/seller');
  return <div>Seller overview page</div>;
}
