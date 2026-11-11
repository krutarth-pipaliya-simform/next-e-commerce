import { requireRole } from '@/lib/authz';

export default async function StoreSettingsPage() {
  await requireRole(['SELLER'], '/seller/settings');
  return <div>Store settings page</div>;
}
