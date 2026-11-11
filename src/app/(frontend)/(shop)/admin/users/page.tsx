import { requireRole } from '@/lib/authz';

export default async function UsersPage() {
  await requireRole(['SUPER_ADMIN'], '/admin/users');
  return <div>Users page</div>;
}
