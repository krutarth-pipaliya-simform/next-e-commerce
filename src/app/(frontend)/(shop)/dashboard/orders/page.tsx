import { requireUser } from '@/lib/authz';

export default async function OrdersPage() {
  await requireUser('/dashboard/orders');
  return <div>Orders page</div>;
}
