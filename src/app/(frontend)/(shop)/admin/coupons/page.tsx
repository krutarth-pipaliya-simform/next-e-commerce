import { requireRole } from '@/lib/authz';

export default async function PlatformCouponsPage() {
  await requireRole(['SUPER_ADMIN'], '/admin/coupons');
  return <div>Platform coupons page</div>;
}
