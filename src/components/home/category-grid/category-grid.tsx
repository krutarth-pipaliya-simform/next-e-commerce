import Link from 'next/link';
import { HomeSection } from '@/components/home/home-section';
import { SectionHeading } from '@/components/home/section-heading';

export type CategoryTile = {
  /** Category id, used as the list key. */
  id: string;
  /** Category name. */
  name: string;
  /** Slug for the `/products?category=` link. */
  slug: string;
  /** Visible products in the category and its subcategories. */
  productCount: number;
};

export type CategoryGridProps = {
  /** Categories to show. The section is hidden when empty. */
  categories: CategoryTile[];
};

/** Category tiles: a grid on desktop, a swipeable row on phones. */
export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <HomeSection id="categories-heading" space="xl">
      <SectionHeading
        id="categories-heading"
        title="Shop by category"
        aside={
          <Link
            href="/products"
            className="inline-flex h-11 items-center text-[15px] font-medium text-accent"
          >
            All categories
          </Link>
        }
      />
      <ul className="-mx-4 mt-8 grid snap-x snap-mandatory auto-cols-[136px] grid-flow-col gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-[repeat(auto-fill,minmax(156px,1fr))] sm:gap-4 sm:overflow-visible sm:px-0">
        {categories.map((category) => (
          <li key={category.id} className="snap-start">
            <Link
              href={`/products?category=${category.slug}`}
              className="flex h-full flex-col gap-3 rounded-card border border-hairline bg-surface px-2.5 pt-2.5 pb-4 transition-colors hover:border-divider"
            >
              <span
                aria-hidden="true"
                className="stage grid aspect-square place-items-center rounded-stage font-display text-5xl text-muted"
              >
                {category.name.charAt(0)}
              </span>
              <span className="flex flex-col gap-0.5 px-1.5">
                <span className="font-medium">{category.name}</span>
                <span className="text-[13px] text-muted">
                  {category.productCount.toLocaleString('en-US')}{' '}
                  {category.productCount === 1 ? 'item' : 'items'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
