import { connection } from 'next/server';
import { cache } from 'react';
import type { Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import {
  PAGE_SIZE,
  priceRanges,
  type ListingFilters,
  type SortKey,
} from '@/lib/listing';

/** A product shoppers may see: published, from an approved store that isn't suspended. */
export const visibleProduct = {
  isPublished: true,
  store: { isApproved: true, isSuspended: false },
} satisfies Prisma.ProductWhereInput;

/** Every category, read once per request however many callers need it. */
const allCategories = cache(() =>
  db.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
  }),
);

/**
 * Search terms: up to 8 distinct words, so a pasted paragraph stays cheap.
 * Prisma passes `contains` straight into ILIKE, so `%`, `_` and `\` are
 * escaped to match themselves instead of acting as wildcards.
 */
function searchTerms(q: string) {
  return [...new Set(q.toLowerCase().split(/\s+/).filter(Boolean))]
    .slice(0, 8)
    .map((term) => term.replace(/[\\%_]/g, '\\$&'));
}

/**
 * Products matching every word of the query, each word found in the name,
 * description, store, category or a variant colour. Case-insensitive.
 */
function searchWhere(q: string | undefined): Prisma.ProductWhereInput {
  if (!q) return {};
  return {
    AND: searchTerms(q).map((term) => {
      const contains = { contains: term, mode: 'insensitive' } as const;
      return {
        OR: [
          { name: contains },
          { description: contains },
          { store: { name: contains } },
          { category: { name: contains } },
          { variants: { some: { color: contains } } },
        ],
      };
    }),
  };
}

const cardSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  createdAt: true,
  store: { select: { name: true, slug: true, isApproved: true } },
  images: {
    select: { url: true, altText: true },
    orderBy: { isPrimary: 'desc' },
    take: 1,
  },
  _count: { select: { variants: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: { url: string; altText: string | null };
  store: { name: string; slug: string; verified: boolean };
  rating?: { average: number; count: number };
  isNew: boolean;
  /** Variant products need a size or colour picked on the product page. */
  hasVariants: boolean;
};

const NEW_FOR_DAYS = 14;

/** Average rating and review count for each product id. */
async function ratingsFor(productIds: string[]) {
  if (productIds.length === 0)
    return new Map<string, CatalogProduct['rating']>();
  const rows = await db.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    rows.map((row) => [
      row.productId,
      { average: row._avg.rating ?? 0, count: row._count._all },
    ]),
  );
}

async function toCatalogProducts(rows: CardRow[]): Promise<CatalogProduct[]> {
  const ratings = await ratingsFor(rows.map((row) => row.id));
  const newSince = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price.toString(),
    image: row.images[0],
    // Only approved stores reach this list, and approval is the verification step.
    store: {
      name: row.store.name,
      slug: row.store.slug,
      verified: row.store.isApproved,
    },
    rating: ratings.get(row.id),
    isNew: row.createdAt.getTime() > newSince,
    hasVariants: row._count.variants > 0,
  }));
}

/**
 * Products for the home page: featured ones first, then the newest.
 * There's no sales data yet, so this is what "trending" means for now.
 */
export async function getTrendingProducts(limit = 8) {
  // Read the database per request, not at build time (CI has no DATABASE_URL).
  await connection();
  const rows = await db.product.findMany({
    where: visibleProduct,
    select: cardSelect,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  return toCatalogProducts(rows);
}

/**
 * Top-level categories with how many visible products each holds,
 * counting products filed under any of its subcategories too.
 * Categories with nothing to show are left out. Pass `q` to count only
 * the products matching a search.
 */
export async function getCategories(limit = 7, q?: string) {
  await connection();
  const [categories, counts] = await Promise.all([
    allCategories(),
    db.product.groupBy({
      by: ['categoryId'],
      where: { ...visibleProduct, ...searchWhere(q) },
      _count: { _all: true },
    }),
  ]);

  const byId = new Map(categories.map((category) => [category.id, category]));
  const rootOf = (id: string) => {
    let category = byId.get(id);
    // The seen set guards against a parent loop in bad data.
    const seen = new Set<string>();
    while (category?.parentId && !seen.has(category.id)) {
      seen.add(category.id);
      category = byId.get(category.parentId) ?? category;
    }
    return category;
  };

  const totals = new Map<string, number>();
  for (const row of counts) {
    const root = rootOf(row.categoryId);
    if (root) totals.set(root.id, (totals.get(root.id) ?? 0) + row._count._all);
  }

  // Built from the totals so every counted product lands in some category,
  // even one stuck in a parent loop; search sums these for its result count.
  return [...totals]
    .flatMap(([id, productCount]) => {
      const category = byId.get(id);
      return category
        ? [{ id, name: category.name, slug: category.slug, productCount }]
        : [];
    })
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, limit);
}

/**
 * The stores with the most visible products, each with three product
 * images and its rating across published products.
 */
export async function getFeaturedStores(limit = 3) {
  await connection();
  const publishedProduct = {
    isPublished: true,
  } satisfies Prisma.ProductWhereInput;

  // Rank by published products only; drafts don't make a store worth featuring.
  const [ranked, storeCount] = await Promise.all([
    db.product.groupBy({
      by: ['storeId'],
      where: visibleProduct,
      _count: { _all: true },
      orderBy: { _count: { storeId: 'desc' } },
      take: limit,
    }),
    db.store.count({
      where: {
        isApproved: true,
        isSuspended: false,
        products: { some: publishedProduct },
      },
    }),
  ]);
  const storeIds = ranked.map((row) => row.storeId);
  if (storeIds.length === 0) return { storeCount, stores: [] };

  const [stores, ratings] = await Promise.all([
    db.store.findMany({
      where: { id: { in: storeIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        products: {
          where: publishedProduct,
          select: {
            id: true,
            name: true,
            images: {
              select: { url: true, altText: true },
              orderBy: { isPrimary: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    }),
    Promise.all(
      storeIds.map((storeId) =>
        db.review.aggregate({
          where: { product: { storeId, ...publishedProduct } },
          _avg: { rating: true },
          _count: { _all: true },
        }),
      ),
    ),
  ]);

  const storeById = new Map(stores.map((store) => [store.id, store]));
  return {
    storeCount,
    stores: ranked.flatMap((row, index) => {
      const store = storeById.get(row.storeId);
      if (!store) return [];
      return [
        {
          ...store,
          productCount: row._count._all,
          rating: {
            average: ratings[index]._avg.rating ?? 0,
            count: ratings[index]._count._all,
          },
        },
      ];
    }),
  };
}

// ---------------------------------------------------------------------------
// Product listing (/products)
// ---------------------------------------------------------------------------

/** A category by slug, for titles. Undefined when no category has it. */
export async function findCategory(slug: string) {
  await connection();
  const category = (await allCategories()).find((c) => c.slug === slug);
  return category && { name: category.name, slug: category.slug };
}

/** The category's id plus the ids of everything filed under it. */
function withDescendants(
  rootId: string,
  categories: { id: string; parentId: string | null }[],
) {
  const ids = new Set([rootId]);
  // Walk down level by level; stops once a pass adds nothing, so a parent
  // loop in bad data can't spin forever.
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId)) {
        if (!ids.has(category.id)) {
          ids.add(category.id);
          grew = true;
        }
      }
    }
  }
  return [...ids];
}

const SIZE_ORDER = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];

/** Clothing sizes in size order, then the rest (shoe sizes, "Kids") A–Z. */
function compareSizes(a: string, b: string) {
  const ai = SIZE_ORDER.indexOf(a.toLowerCase());
  const bi = SIZE_ORDER.indexOf(b.toLowerCase());
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b, 'en', { numeric: true });
}

/** Distinct values ignoring case, keeping the first spelling seen. */
function distinctValues(values: (string | null)[]) {
  const byKey = new Map<string, string>();
  for (const value of values) {
    const label = value?.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, label);
  }
  return [...byKey].map(([value, label]) => ({ value, label }));
}

export type ListingFacets = {
  categories: { slug: string; name: string }[];
  stores: { slug: string; name: string }[];
  /** `value` is lower case for the URL; `label` keeps the seller's spelling. */
  sizes: { value: string; label: string }[];
  colors: { value: string; label: string }[];
};

/**
 * The options the listing's filters offer, from what's actually for sale.
 * Pass `q` to offer only what the search found.
 */
export async function getListingFacets(q?: string): Promise<ListingFacets> {
  await connection();
  const matching = { ...visibleProduct, ...searchWhere(q) };
  const variantOfVisible = { product: matching };

  const [categories, counts, stores, sizes, colors] = await Promise.all([
    allCategories(),
    db.product.groupBy({
      by: ['categoryId'],
      where: matching,
      _count: { _all: true },
    }),
    db.store.findMany({
      where: {
        isApproved: true,
        isSuspended: false,
        products: { some: { isPublished: true, ...searchWhere(q) } },
      },
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.productVariant.findMany({
      where: { ...variantOfVisible, size: { not: null } },
      select: { size: true },
      distinct: ['size'],
    }),
    db.productVariant.findMany({
      where: { ...variantOfVisible, color: { not: null } },
      select: { color: true },
      distinct: ['color'],
    }),
  ]);

  // Top-level categories that hold a visible product somewhere beneath them.
  const stocked = new Set(counts.map((row) => row.categoryId));
  const topLevel = categories
    .filter(
      (category) =>
        !category.parentId &&
        withDescendants(category.id, categories).some((id) => stocked.has(id)),
    )
    .map(({ slug, name }) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    categories: topLevel,
    stores,
    sizes: distinctValues(sizes.map((row) => row.size)).sort((a, b) =>
      compareSizes(a.label, b.label),
    ),
    colors: distinctValues(colors.map((row) => row.color)).sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
  };
}

const listingOrder: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> =
  {
    featured: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    newest: [{ createdAt: 'desc' }],
    'price-asc': [{ price: 'asc' }],
    'price-desc': [{ price: 'desc' }],
  };

/**
 * One page of visible products matching the filters, plus the total and
 * how many stores they come from. A page past the end shows the last page.
 */
export async function getListing(filters: ListingFilters) {
  await connection();

  const categories = await allCategories();
  const category = filters.category
    ? categories.find((c) => c.slug === filters.category)
    : undefined;
  const range = priceRanges.find((r) => r.key === filters.price);

  // Size and colour must match on the same variant: "M in Cobalt", not
  // an M in one colour and Cobalt in another size.
  const variant: Prisma.ProductVariantWhereInput[] = [];
  if (filters.size)
    variant.push({ size: { equals: filters.size, mode: 'insensitive' } });
  if (filters.colors.length)
    variant.push({
      OR: filters.colors.map((color) => ({
        color: { equals: color, mode: 'insensitive' },
      })),
    });

  const where: Prisma.ProductWhereInput = {
    ...visibleProduct,
    ...searchWhere(filters.q),
    ...(filters.store && {
      store: { ...visibleProduct.store, slug: filters.store },
    }),
    // An unknown slug matches nothing, like an unknown store does.
    ...(filters.category && {
      categoryId: {
        in: category ? withDescendants(category.id, categories) : [],
      },
    }),
    ...(range && { price: { gte: range.min, lt: range.max } }),
    ...(variant.length && { variants: { some: { AND: variant } } }),
  };

  const [total, storeRows] = await Promise.all([
    db.product.count({ where }),
    db.product.groupBy({ by: ['storeId'], where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const rows = await db.product.findMany({
    where,
    select: cardSelect,
    // The id tiebreak keeps the order stable, so pages don't overlap.
    orderBy: [...listingOrder[filters.sort], { id: 'asc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return {
    products: await toCatalogProducts(rows),
    total,
    storeCount: storeRows.length,
    page,
    pageCount,
    /** The matched category, so the page can title itself with it. */
    category: category && { name: category.name, slug: category.slug },
  };
}

// ---------------------------------------------------------------------------
// Search (/search)
// ---------------------------------------------------------------------------

export type SearchStore = {
  slug: string;
  name: string;
  /** Visible products from this store that match the search. */
  matchCount: number;
};

/**
 * Stores for a search: the ones with the most matching products, then
 * stores whose name matches but whose products don't.
 */
export async function getSearchStores(q: string, limit = 3) {
  await connection();
  const liveStore = { isApproved: true, isSuspended: false };

  const ranked = await db.product.groupBy({
    by: ['storeId'],
    where: { ...visibleProduct, ...searchWhere(q) },
    _count: { _all: true },
    orderBy: { _count: { storeId: 'desc' } },
    take: limit,
  });
  const rankedIds = ranked.map((row) => row.storeId);

  const [withProducts, byName] = await Promise.all([
    db.store.findMany({
      where: { id: { in: rankedIds } },
      select: { id: true, slug: true, name: true },
    }),
    rankedIds.length < limit
      ? db.store.findMany({
          where: {
            ...liveStore,
            id: { notIn: rankedIds },
            products: { some: { isPublished: true } },
            AND: searchTerms(q).map((term) => ({
              name: { contains: term, mode: 'insensitive' as const },
            })),
          },
          select: { id: true, slug: true, name: true },
          orderBy: { name: 'asc' },
          take: limit - rankedIds.length,
        })
      : [],
  ]);

  const storeById = new Map(withProducts.map((store) => [store.id, store]));
  const stores: SearchStore[] = ranked.flatMap((row) => {
    const store = storeById.get(row.storeId);
    return store
      ? [{ slug: store.slug, name: store.name, matchCount: row._count._all }]
      : [];
  });
  for (const store of byName)
    stores.push({ slug: store.slug, name: store.name, matchCount: 0 });
  return stores;
}

// ---------------------------------------------------------------------------
// Product page (/product/[id])
// ---------------------------------------------------------------------------

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  categoryId: true,
  store: {
    select: { id: true, name: true, slug: true, isApproved: true },
  },
  images: {
    select: { id: true, url: true, altText: true },
    orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
  },
  variants: {
    select: { id: true, size: true, color: true, stock: true, priceDiff: true },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.ProductSelect;

export type ProductVariantOption = {
  id: string;
  /** Lower-case size, or null when variants don't vary by size. */
  size: string | null;
  /** Lower-case colour, or null when variants don't vary by colour. */
  color: string | null;
  stock: number;
  /** Price difference from the base price, as a decimal string. */
  priceDiff: string;
};

/** The trail from the top-level category down to this one. */
function categoryTrail(
  id: string,
  categories: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }[],
) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const trail: { id: string; name: string; slug: string }[] = [];
  const seen = new Set<string>();
  let category = byId.get(id);
  // The seen set guards against a parent loop in bad data.
  while (category && !seen.has(category.id)) {
    seen.add(category.id);
    trail.unshift({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });
    category = category.parentId ? byId.get(category.parentId) : undefined;
  }
  return trail;
}

/**
 * A product shoppers may see, with everything the product page shows
 * above the fold. Null when it doesn't exist or isn't visible. Cached per
 * request, so metadata and the page share one query.
 */
export const getProduct = cache(async (id: string) => {
  await connection();
  const [row, categories] = await Promise.all([
    db.product.findFirst({
      where: { id, ...visibleProduct },
      select: productSelect,
    }),
    allCategories(),
  ]);
  if (!row) return null;

  const variants: ProductVariantOption[] = row.variants.map((variant) => ({
    id: variant.id,
    size: variant.size?.trim().toLowerCase() || null,
    color: variant.color?.trim().toLowerCase() || null,
    stock: variant.stock,
    priceDiff: variant.priceDiff.toString(),
  }));

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price.toString(),
    categoryId: row.categoryId,
    categories: categoryTrail(row.categoryId, categories),
    // Only approved stores reach this page, and approval is the verification step.
    store: {
      id: row.store.id,
      name: row.store.name,
      slug: row.store.slug,
      verified: row.store.isApproved,
    },
    images: row.images,
    variants,
    /** `value` matches the variants' lower-case colour; `label` keeps the seller's spelling. */
    colours: distinctValues(row.variants.map((variant) => variant.color)),
    sizes: distinctValues(row.variants.map((variant) => variant.size)).sort(
      (a, b) => compareSizes(a.label, b.label),
    ),
  };
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

/** Average rating, review count and how many reviews gave each star rating. */
export const getReviewSummary = cache(async (productId: string) => {
  await connection();
  const rows = await db.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { _all: true },
  });
  const counts = new Map(rows.map((row) => [row.rating, row._count._all]));
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts.get(stars) ?? 0,
  }));
  const count = breakdown.reduce((sum, row) => sum + row.count, 0);
  const total = breakdown.reduce((sum, row) => sum + row.stars * row.count, 0);
  return { average: count ? total / count : 0, count, breakdown };
});

/** The newest reviews of a product, with the reviewer's name. */
export async function getReviews(productId: string, limit = 6) {
  await connection();
  return db.review.findMany({
    where: { productId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    take: limit,
  });
}

/**
 * The selling store for the product page: its description, rating across
 * published products, product count, and a few other products from it.
 */
export async function getSellerSummary(
  storeId: string,
  excludeProductId: string,
  limit = 3,
) {
  await connection();
  const publishedProduct = { storeId, isPublished: true };
  const [store, productCount, rating, others] = await Promise.all([
    db.store.findUnique({
      where: { id: storeId },
      select: { description: true, createdAt: true },
    }),
    db.product.count({ where: publishedProduct }),
    db.review.aggregate({
      where: { product: publishedProduct },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    db.product.findMany({
      where: { ...visibleProduct, storeId, id: { not: excludeProductId } },
      select: cardSelect,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    }),
  ]);

  return {
    description: store?.description ?? null,
    since: store?.createdAt.getFullYear(),
    productCount,
    rating: { average: rating._avg.rating ?? 0, count: rating._count._all },
    products: await toCatalogProducts(others),
  };
}

/**
 * Products from the same top-level category, from any store, for
 * "You may also like". Featured first, then the newest.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
) {
  await connection();
  const categories = await allCategories();
  const rootId = categoryTrail(categoryId, categories)[0]?.id ?? categoryId;

  const rows = await db.product.findMany({
    where: {
      ...visibleProduct,
      id: { not: productId },
      categoryId: { in: withDescendants(rootId, categories) },
    },
    select: cardSelect,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
    take: limit,
  });
  return toCatalogProducts(rows);
}
