import { requireUser } from '@/lib/authz';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/dashboard/orders/${id}`);
  return <div>Order detail page: {id}</div>;
}
