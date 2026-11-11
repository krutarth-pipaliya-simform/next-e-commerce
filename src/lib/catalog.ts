import { connection } from 'next/server';
import type { Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';

/** A product shoppers may see: published, from an approved store that isn't suspended. */
export const visibleProduct = {
  isPublished: true,
  store: { isApproved: true, isSuspended: false },
} satisfies Prisma.ProductWhereInput;

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
 * Categories with nothing to show are left out.
 */
export async function getCategories(limit = 7) {
  await connection();
  const [categories, counts] = await Promise.all([
    db.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    db.product.groupBy({
      by: ['categoryId'],
      where: visibleProduct,
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

  return categories
    .filter((category) => !category.parentId && totals.has(category.id))
    .map(({ id, name, slug }) => ({
      id,
      name,
      slug,
      productCount: totals.get(id) ?? 0,
    }))
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
