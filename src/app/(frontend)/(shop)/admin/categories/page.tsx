import { requireRole } from '@/lib/authz';

export default async function CategoriesPage() {
  await requireRole(['SUPER_ADMIN'], '/admin/categories');
  return <div>Categories page</div>;
}
