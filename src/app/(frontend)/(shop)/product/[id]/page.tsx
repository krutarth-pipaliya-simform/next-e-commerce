import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BuyPanel } from '@/components/product/buy-panel';
import { ProductAbout } from '@/components/product/product-about';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductReviews } from '@/components/product/product-reviews';
import { RelatedProducts } from '@/components/product/related-products';
import { SellerCard } from '@/components/product/seller-card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { getProduct, getReviewSummary } from '@/lib/catalog';
import { listingHref, parseListingParams } from '@/lib/listing';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product not found' };

  const description = product.description.replace(/\s+/g, ' ').trim();
  const image = product.images[0];
  return {
    title: product.name,
    description:
      description.length > 160 ? `${description.slice(0, 157)}…` : description,
    openGraph: {
      title: `${product.name} from ${product.store.name}`,
      images: image
        ? [{ url: image.url, alt: image.altText ?? product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const rating = await getReviewSummary(product.id);
  const noFilters = parseListingParams({});
  const join = (items: { label: string }[]) =>
    items.map((item) => item.label).join(', ') || undefined;

  return (
    <Container className="pt-8 pb-16 sm:pb-24">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          ...product.categories.map((category) => ({
            label: category.name,
            href: listingHref(noFilters, { category: category.slug }),
          })),
          { label: product.name },
        ]}
      />

      <div className="mt-2 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:gap-10">
        <ProductGallery productName={product.name} images={product.images} />
        <BuyPanel
          productId={product.id}
          name={product.name}
          price={product.price}
          store={product.store}
          rating={{ average: rating.average, count: rating.count }}
          variants={product.variants}
          colours={product.colours}
          sizes={product.sizes}
        />
      </div>

      <div className="mt-16 sm:mt-24">
        <ProductAbout
          name={product.name}
          description={product.description}
          details={[
            {
              label: 'Category',
              value: product.categories.map((c) => c.name).join(' › '),
            },
            { label: 'Colours', value: join(product.colours) },
            { label: 'Sizes', value: join(product.sizes) },
            { label: 'Sold by', value: product.store.name },
          ]}
        />
      </div>

      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-72 rounded-panel" />}>
          <SellerCard productId={product.id} store={product.store} />
        </Suspense>
      </div>

      <div className="mt-16 sm:mt-24">
        <Suspense fallback={<Skeleton className="h-96 rounded-panel" />}>
          <ProductReviews productId={product.id} />
        </Suspense>
      </div>

      <div className="mt-16 sm:mt-24">
        <Suspense fallback={<Skeleton className="h-96 rounded-panel" />}>
          <RelatedProducts
            productId={product.id}
            categoryId={product.categoryId}
          />
        </Suspense>
      </div>
    </Container>
  );
}
