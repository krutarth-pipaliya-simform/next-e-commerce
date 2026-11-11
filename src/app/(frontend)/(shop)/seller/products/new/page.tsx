import { requireRole } from '@/lib/authz';

export default async function ProductEditorPage() {
  await requireRole(['SELLER'], '/seller/products/new');
  return <div>Product editor page</div>;
}
