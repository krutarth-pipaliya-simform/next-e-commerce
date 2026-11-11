import { requireUser } from '@/lib/authz';

export default async function ProfileAddressesPage() {
  await requireUser('/dashboard/settings');
  return <div>Profile & addresses page</div>;
}
