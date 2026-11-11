import { requireUser } from '@/lib/authz';

export default async function DashboardPage() {
  await requireUser('/dashboard');
  return <div>Dashboard Page</div>;
}
