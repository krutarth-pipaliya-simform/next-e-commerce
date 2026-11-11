import Link from 'next/link';
import type { CSSProperties } from 'react';
import { XIcon } from '@/components/ui/icons';
import type { ListingFacets } from '@/lib/catalog';
import { colourHex } from '@/lib/colours';
import {
  clearedFilters,
  hasFilters,
  labelFromValue,
  listingHref,
  priceRanges,
  toggleColour,
  type ListingFilters,
} from '@/lib/listing';

export type ActiveFiltersProps = {
  /** The filters in the URL. */
  filters: ListingFilters;
  /** Facet labels, so chips show names rather than URL slugs. */
  facets: ListingFacets;
};

type Chip = { key: string; label: string; href: string; swatch?: string };

/**
 * One removable chip per filter in effect, then "Clear all". With no
 * filters set, a hint on how to narrow the list.
 */
export function ActiveFilters({ filters, facets }: ActiveFiltersProps) {
  if (!hasFilters(filters)) {
    return (
      <p className="flex min-h-11 items-center text-sm text-muted">
        No filters applied. Use the filters above to narrow the list.
      </p>
    );
  }

  const href = (changes: Partial<ListingFilters>) =>
    listingHref(filters, changes);
  const chips: Chip[] = [];

  if (filters.category)
    chips.push({
      key: 'category',
      label:
        facets.categories.find((c) => c.slug === filters.category)?.name ??
        labelFromValue(filters.category),
      href: href({ category: undefined }),
    });
  if (filters.price)
    chips.push({
      key: 'price',
      label:
        priceRanges.find((r) => r.key === filters.price)?.label ??
        filters.price,
      href: href({ price: undefined }),
    });
  if (filters.size)
    chips.push({
      key: 'size',
      label: `Size ${
        facets.sizes.find((s) => s.value === filters.size)?.label ??
        labelFromValue(filters.size)
      }`,
      href: href({ size: undefined }),
    });
  if (filters.store)
    chips.push({
      key: 'store',
      label:
        facets.stores.find((s) => s.slug === filters.store)?.name ??
        labelFromValue(filters.store),
      href: href({ store: undefined }),
    });
  for (const color of filters.colors)
    chips.push({
      key: `color-${color}`,
      label:
        facets.colors.find((c) => c.value === color)?.label ??
        labelFromValue(color),
      href: href({ colors: toggleColour(filters.colors, color) }),
      swatch: colourHex(color),
    });

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            scroll={false}
            aria-label={`Remove filter: ${chip.label}`}
            className="glass-adaptive inline-flex h-11 items-center gap-2 rounded-chip pr-2.5 pl-3.5 text-sm font-medium text-ink hover:border-divider"
            style={
              chip.swatch
                ? ({ '--tint': chip.swatch } as CSSProperties)
                : undefined
            }
          >
            {chip.swatch && (
              <span
                aria-hidden="true"
                className="size-3.5 rounded-full bg-(--tint) shadow-[0_0_0_1px_var(--color-divider)]"
              />
            )}
            {chip.label}
            <XIcon width={14} height={14} className="text-muted" />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={listingHref(filters, clearedFilters)}
          scroll={false}
          className="inline-flex h-11 items-center rounded-control px-3 text-sm font-medium text-ink hover:bg-ink/6"
        >
          Clear all
        </Link>
      </li>
    </ul>
  );
}
