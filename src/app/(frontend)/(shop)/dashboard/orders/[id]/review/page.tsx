import { requireUser } from '@/lib/authz';

export default async function WriteAReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/dashboard/orders/${id}/review`);
  return <div>Write a review page: {id}</div>;
}
