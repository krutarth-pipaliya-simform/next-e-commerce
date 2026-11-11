import { requireRole } from '@/lib/authz';

export default async function StoreApprovalsPage() {
  await requireRole(['SUPER_ADMIN'], '/admin/stores');
  return <div>Store approvals page</div>;
}
