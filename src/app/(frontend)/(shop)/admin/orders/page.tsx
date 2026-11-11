import { requireRole } from '@/lib/authz';

export default async function AllOrdersPage() {
  await requireRole(['SUPER_ADMIN'], '/admin/orders');
  return <div>All orders page</div>;
}
