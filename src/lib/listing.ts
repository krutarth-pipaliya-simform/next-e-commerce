/**
 * The product listing's filters live in the URL, so a filtered view can be
 * shared, bookmarked and reached without JavaScript. This module reads them
 * from search params and builds the links that change them.
 */

export const PAGE_SIZE = 24;

export const priceRanges = [
  { key: 'under-1000', label: 'Under ₹1,000', min: 0, max: 1000 },
  { key: '1000-2500', label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { key: '2500-5000', label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { key: '5000-10000', label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { key: '10000-plus', label: '₹10,000 and up', min: 10000, max: undefined },
] as const;

export const sortOptions = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price, low to high' },
  { key: 'price-desc', label: 'Price, high to low' },
] as const;

export type PriceKey = (typeof priceRanges)[number]['key'];
export type SortKey = (typeof sortOptions)[number]['key'];

export type ListingFilters = {
  /** Category slug; matches the category and all its subcategories. */
  category?: string;
  price?: PriceKey;
  /** Variant size, lower case. */
  size?: string;
  /** Store slug. */
  store?: string;
  /** Variant colours, lower case. A product matches any of them. */
  colors: string[];
  sort: SortKey;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  const one = Array.isArray(value) ? value[0] : value;
  const trimmed = one?.trim();
  return trimmed ? trimmed : undefined;
}

function isPriceKey(value: string | undefined): value is PriceKey {
  return priceRanges.some((range) => range.key === value);
}

function isSortKey(value: string | undefined): value is SortKey {
  return sortOptions.some((option) => option.key === value);
}

/** Reads the filters from the page's search params, dropping invalid values. */
export function parseListingParams(params: SearchParams): ListingFilters {
  const price = first(params.price);
  const sort = first(params.sort);
  const page = Number(first(params.page));
  // `color` repeats for several colours (?color=mint&color=cobalt).
  const colors = [params.color ?? []]
    .flat()
    .map((color) => color.trim().toLowerCase())
    .filter(Boolean);

  return {
    category: first(params.category)?.toLowerCase(),
    price: isPriceKey(price) ? price : undefined,
    size: first(params.size)?.toLowerCase(),
    store: first(params.store)?.toLowerCase(),
    colors: [...new Set(colors)],
    sort: isSortKey(sort) ? sort : 'featured',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/**
 * A `/products` link with `changes` applied to `filters`. Any change other
 * than the page goes back to page 1. Defaults are left out of the URL.
 */
export function listingHref(
  filters: ListingFilters,
  changes: Partial<ListingFilters> = {},
) {
  const next = {
    ...filters,
    page: 1,
    ...changes,
  };
  const params = new URLSearchParams();
  if (next.category) params.set('category', next.category);
  if (next.price) params.set('price', next.price);
  if (next.size) params.set('size', next.size);
  if (next.store) params.set('store', next.store);
  for (const color of next.colors) params.append('color', color);
  if (next.sort !== 'featured') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', String(next.page));

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

/** Adds the colour if it isn't selected, removes it if it is. */
export function toggleColour(colors: string[], color: string) {
  return colors.includes(color)
    ? colors.filter((c) => c !== color)
    : [...colors, color];
}

/** The changes that remove every filter, keeping the sort. */
export const clearedFilters = {
  category: undefined,
  price: undefined,
  size: undefined,
  store: undefined,
  colors: [],
} satisfies Partial<ListingFilters>;

/**
 * A readable label for a URL value no option matches, e.g. a colour that
 * nothing comes in any more: "forest-green" → "Forest green".
 */
export function labelFromValue(value: string) {
  const words = value.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** True when any filter is set. Sort and page don't count. */
export function hasFilters(filters: ListingFilters) {
  return Boolean(
    filters.category ||
    filters.price ||
    filters.size ||
    filters.store ||
    filters.colors.length,
  );
}
