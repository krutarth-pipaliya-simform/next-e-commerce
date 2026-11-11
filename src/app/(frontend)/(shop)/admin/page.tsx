import { requireRole } from '@/lib/authz';

export default async function AdminDashboardPage() {
  await requireRole(['SUPER_ADMIN'], '/admin');
  return <div>Admin Dashboard Page</div>;
}
