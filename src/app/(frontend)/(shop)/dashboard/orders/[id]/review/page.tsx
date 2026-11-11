export default async function WriteAReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>Write a review page: {id}</div>;
}
