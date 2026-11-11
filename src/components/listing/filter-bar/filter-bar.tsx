import { ColourFilter } from '@/components/listing/colour-filter';
import { FilterMenu } from '@/components/listing/filter-menu';
import type { ListingFacets } from '@/lib/catalog';
import {
  labelFromValue,
  listingHref,
  priceRanges,
  sortOptions,
  toggleColour,
  type ListingFilters,
} from '@/lib/listing';

export type FilterBarProps = {
  /** The filters in the URL. */
  filters: ListingFilters;
  /** What each filter can be set to. */
  facets: ListingFacets;
  /**
   * Shows the Category menu. Search hides it and offers category chips
   * with result counts instead.
   * @default true
   */
  showCategory?: boolean;
};

/**
 * The listing's glass control bar: filter and sort menus, then colour
 * swatches. Sticks under the header from 640px up; on phones the header
 * has its own search row, so the bar scrolls with the page.
 */
export function FilterBar({
  filters,
  facets,
  showCategory = true,
}: FilterBarProps) {
  const href = (changes: Partial<ListingFilters>) =>
    listingHref(filters, changes);

  // A value from the URL that isn't among the options (a sold-out size, a
  // shared link) is still listed, so the menu shows it and it can be undone.
  const withCurrent = <T extends { value: string; label: string }>(
    options: T[],
    current: string | undefined,
  ) =>
    current && !options.some((o) => o.value === current)
      ? [...options, { value: current, label: labelFromValue(current) }]
      : options;

  const categories = withCurrent(
    facets.categories.map((c) => ({ value: c.slug, label: c.name })),
    filters.category,
  );
  const stores = withCurrent(
    facets.stores.map((s) => ({ value: s.slug, label: s.name })),
    filters.store,
  );
  const sizes = withCurrent(facets.sizes, filters.size);
  const colours = filters.colors.reduce(
    (list, color) => withCurrent(list, color),
    facets.colors,
  );

  const labelOf = (
    options: { value: string; label: string }[],
    current: string | undefined,
    fallback: string,
  ) => options.find((o) => o.value === current)?.label ?? fallback;

  return (
    <section
      aria-label="Filters and sort"
      className="glass-chrome relative z-10 flex flex-col gap-2.5 rounded-panel p-2 sm:sticky sm:top-24 sm:p-2.5"
    >
      <div className="-mx-2 flex items-center gap-2 overflow-x-auto px-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>*]:flex-none">
        {showCategory && (
          <FilterMenu
            label="Category"
            value={labelOf(categories, filters.category, 'All')}
            active={Boolean(filters.category)}
            options={[
              {
                label: 'All',
                href: href({ category: undefined }),
                selected: !filters.category,
              },
              ...categories.map((c) => ({
                label: c.label,
                href: href({ category: c.value }),
                selected: c.value === filters.category,
              })),
            ]}
          />
        )}
        <FilterMenu
          label="Price"
          value={
            priceRanges.find((r) => r.key === filters.price)?.label ??
            'Any price'
          }
          active={Boolean(filters.price)}
          options={[
            {
              label: 'Any price',
              href: href({ price: undefined }),
              selected: !filters.price,
            },
            ...priceRanges.map((r) => ({
              label: r.label,
              href: href({ price: r.key }),
              selected: r.key === filters.price,
            })),
          ]}
        />
        {sizes.length > 0 && (
          <FilterMenu
            label="Size"
            value={labelOf(sizes, filters.size, 'Any size')}
            active={Boolean(filters.size)}
            options={[
              {
                label: 'Any size',
                href: href({ size: undefined }),
                selected: !filters.size,
              },
              ...sizes.map((s) => ({
                label: s.label,
                href: href({ size: s.value }),
                selected: s.value === filters.size,
              })),
            ]}
          />
        )}
        <FilterMenu
          label="Store"
          value={labelOf(stores, filters.store, 'Any store')}
          active={Boolean(filters.store)}
          options={[
            {
              label: 'Any store',
              href: href({ store: undefined }),
              selected: !filters.store,
            },
            ...stores.map((s) => ({
              label: s.label,
              href: href({ store: s.value }),
              selected: s.value === filters.store,
            })),
          ]}
        />
        <div className="sm:ml-auto">
          <FilterMenu
            label="Sort"
            align="end"
            value={
              sortOptions.find((o) => o.key === filters.sort)?.label ??
              'Featured'
            }
            options={sortOptions.map((o) => ({
              label: o.label,
              href: href({ sort: o.key }),
              selected: o.key === filters.sort,
            }))}
          />
        </div>
      </div>

      {colours.length > 0 && (
        <>
          <div aria-hidden="true" className="h-px bg-hairline" />
          <ColourFilter
            colours={colours.map((c) => ({
              ...c,
              href: href({ colors: toggleColour(filters.colors, c.value) }),
              selected: filters.colors.includes(c.value),
            }))}
          />
        </>
      )}
    </section>
  );
}
