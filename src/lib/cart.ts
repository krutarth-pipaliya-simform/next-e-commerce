import { connection } from 'next/server';
import { visibleProduct } from '@/lib/catalog';
import { FREE_SHIPPING_MIN, MAX_QUANTITY, shippingFor } from '@/lib/cart-rules';
import { db } from '@/lib/db';

/**
 * Whether a bag line can be bought as it stands:
 * - `ok`: yes.
 * - `over-stock`: fewer are left than the bag holds; lowering the quantity fixes it.
 * - `sold-out`: the chosen option has no stock.
 * - `unavailable`: the product was unpublished, its store isn't live, or its option was deleted.
 */
export type LineAvailability = 'ok' | 'over-stock' | 'sold-out' | 'unavailable';

export type BagLine = {
  /** The cart item id, passed to the cart Server Actions. */
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  image?: { url: string; altText: string | null };
  /** Colour and size as the seller spelled them, e.g. "Tangerine · 9". */
  options: string | null;
  /** The variant's fields, snapshotted onto the order item at checkout. */
  size: string | null;
  color: string | null;
  sku: string | null;
  /** Base price plus the variant's price difference, in rupees. */
  unitPrice: number;
  quantity: number;
  /** unitPrice × quantity, in rupees. */
  lineTotal: number;
  /** Stock of the chosen variant; null for a product sold without variants. */
  stock: number | null;
  /** The most the quantity stepper allows. */
  maxQuantity: number;
  availability: LineAvailability;
};

export type BagGroup = {
  store: { id: string; name: string; slug: string };
  lines: BagLine[];
  /** Items (summed quantities) from this store. */
  itemCount: number;
  /** In rupees. */
  subtotal: number;
};

export type Bag = {
  /** Lines that can be bought, grouped by the store that ships them, in the order first added. */
  groups: BagGroup[];
  /** Sold-out and unavailable lines. They're left out of every total. */
  unavailable: BagLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** How much more to spend for free shipping; 0 once it's reached. */
  freeShippingRemaining: number;
  /** False while the bag is empty or a line holds more than is in stock. */
  canCheckout: boolean;
  /** Every product in the bag, so suggestions can leave them out. */
  productIds: string[];
  /** The categories of the products in the bag, for suggestions. */
  categoryIds: string[];
};

// Money is summed in paise, so rupee amounts don't pick up float error.
const toPaise = (value: { toString(): string }) =>
  Math.round(Number(value.toString()) * 100);

/** The signed-in user's bag, priced and grouped by store. */
export async function getBag(userId: string): Promise<Bag> {
  await connection();
  const items = await db.cartItem.findMany({
    where: { cart: { userId } },
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          isPublished: true,
          categoryId: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              isApproved: true,
              isSuspended: true,
            },
          },
          images: {
            select: { url: true, altText: true },
            orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
            take: 1,
          },
          _count: { select: { variants: true } },
        },
      },
      variant: {
        select: {
          id: true,
          size: true,
          color: true,
          sku: true,
          stock: true,
          priceDiff: true,
        },
      },
    },
    // Cart items have no timestamp; cuids sort roughly by creation.
    orderBy: { id: 'asc' },
  });

  const groups = new Map<string, BagGroup>();
  const unavailable: BagLine[] = [];
  let subtotalPaise = 0;
  let itemCount = 0;
  let canCheckout = true;

  for (const item of items) {
    const { product, variant } = item;
    const visible =
      product.isPublished &&
      product.store.isApproved &&
      !product.store.isSuspended;
    // A product with variants needs one; a deleted variant leaves it null.
    const missingVariant = product._count.variants > 0 && !variant;
    const stock = variant?.stock ?? null;

    const availability: LineAvailability =
      !visible || missingVariant
        ? 'unavailable'
        : stock !== null && stock <= 0
          ? 'sold-out'
          : stock !== null && item.quantity > stock
            ? 'over-stock'
            : 'ok';

    const unitPaise =
      toPaise(product.price) + (variant ? toPaise(variant.priceDiff) : 0);
    const line: BagLine = {
      id: item.id,
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      image: product.images[0],
      options:
        [variant?.color?.trim(), variant?.size?.trim()]
          .filter(Boolean)
          .join(' · ') || null,
      size: variant?.size ?? null,
      color: variant?.color ?? null,
      sku: variant?.sku ?? null,
      unitPrice: unitPaise / 100,
      quantity: item.quantity,
      lineTotal: (unitPaise * item.quantity) / 100,
      stock,
      maxQuantity: Math.max(1, Math.min(stock ?? MAX_QUANTITY, MAX_QUANTITY)),
      availability,
    };

    if (availability === 'unavailable' || availability === 'sold-out') {
      unavailable.push(line);
      continue;
    }
    if (availability === 'over-stock') canCheckout = false;

    const { store } = product;
    const group = groups.get(store.id) ?? {
      store: { id: store.id, name: store.name, slug: store.slug },
      lines: [],
      itemCount: 0,
      subtotal: 0,
    };
    group.lines.push(line);
    group.itemCount += item.quantity;
    group.subtotal =
      (toPaise(group.subtotal) + unitPaise * item.quantity) / 100;
    groups.set(store.id, group);

    subtotalPaise += unitPaise * item.quantity;
    itemCount += item.quantity;
  }

  const subtotal = subtotalPaise / 100;
  const shipping = shippingFor(subtotal, groups.size);
  return {
    groups: [...groups.values()],
    unavailable,
    itemCount,
    subtotal,
    shipping,
    total: (subtotalPaise + shipping * 100) / 100,
    freeShippingRemaining: Math.max(
      0,
      (FREE_SHIPPING_MIN * 100 - subtotalPaise) / 100,
    ),
    canCheckout: canCheckout && groups.size > 0,
    productIds: [...new Set(items.map((item) => item.product.id))],
    categoryIds: [...new Set(items.map((item) => item.product.categoryId))],
  };
}

/** Items in the user's bag (summed quantities) that shoppers can still buy, for the header badge. */
export async function getBagCount(userId: string) {
  await connection();
  const result = await db.cartItem.aggregate({
    where: { cart: { userId }, product: visibleProduct },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
