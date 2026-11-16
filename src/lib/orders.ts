import { connection } from 'next/server';
import type {
  DeliverySpeed,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/generated/prisma/enums';
import { db } from '@/lib/db';

/** A short order number to show shoppers, e.g. "DL-7Q2K9X". */
export function orderNumber(orderId: string) {
  return `DL-${orderId.slice(-6).toUpperCase()}`;
}

export type PlacedOrderItem = {
  id: string;
  /** Null once the product is deleted; the snapshot still shows. */
  productId: string | null;
  name: string;
  image?: { url: string; altText: string | null };
  /** Colour and size at the time of purchase, e.g. "Tangerine · 9". */
  options: string | null;
  /** In rupees. */
  unitPrice: number;
  quantity: number;
  /** In rupees. */
  lineTotal: number;
};

export type PlacedStoreOrder = {
  id: string;
  status: OrderStatus;
  store: { name: string; slug: string };
  deliverySpeed: DeliverySpeed;
  /** In rupees. */
  shippingFee: number;
  /** In rupees. */
  subtotal: number;
  itemCount: number;
  items: PlacedOrderItem[];
};

export type PlacedOrder = {
  id: string;
  number: string;
  createdAt: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cardLast4: string | null;
  /** In rupees. */
  subtotal: number;
  shippingTotal: number;
  total: number;
  itemCount: number;
  shipTo: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  storeOrders: PlacedStoreOrder[];
  /** For suggestions after the order. */
  productIds: string[];
  categoryIds: string[];
};

const rupees = (value: { toString(): string }) => Number(value.toString());

/** One of the user's orders with its store orders and items, or null if it isn't theirs. */
export async function getPlacedOrder(
  orderId: string,
  userId: string,
): Promise<PlacedOrder | null> {
  await connection();
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      storeOrders: {
        orderBy: { id: 'asc' },
        include: {
          store: { select: { name: true, slug: true } },
          items: {
            orderBy: { id: 'asc' },
            include: {
              product: {
                select: {
                  categoryId: true,
                  images: {
                    select: { url: true, altText: true },
                    orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!order) return null;

  const storeOrders = order.storeOrders.map((storeOrder) => {
    const items = storeOrder.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.product?.images[0],
      options:
        [item.color?.trim(), item.size?.trim()].filter(Boolean).join(' · ') ||
        null,
      unitPrice: rupees(item.price),
      quantity: item.quantity,
      lineTotal: (Math.round(rupees(item.price) * 100) * item.quantity) / 100,
    }));
    return {
      id: storeOrder.id,
      status: storeOrder.status,
      store: storeOrder.store,
      deliverySpeed: storeOrder.deliverySpeed,
      shippingFee: rupees(storeOrder.shippingFee),
      subtotal: rupees(storeOrder.subTotal),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      items,
    };
  });

  const allItems = order.storeOrders.flatMap((storeOrder) => storeOrder.items);
  return {
    id: order.id,
    number: orderNumber(order.id),
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    cardLast4: order.cardLast4,
    subtotal: rupees(order.subTotal),
    shippingTotal: rupees(order.shippingTotal),
    total: rupees(order.totalAmount),
    itemCount: storeOrders.reduce((sum, so) => sum + so.itemCount, 0),
    shipTo: {
      name: order.shippingName,
      street: order.shippingStreet,
      city: order.shippingCity,
      state: order.shippingState,
      zipCode: order.shippingZipCode,
      country: order.shippingCountry,
      phone: order.shippingPhone,
    },
    storeOrders,
    productIds: [...new Set(allItems.flatMap((item) => item.productId ?? []))],
    categoryIds: [
      ...new Set(allItems.flatMap((item) => item.product?.categoryId ?? [])),
    ],
  };
}

/** Orders per page in the order history. */
export const ORDERS_PAGE_SIZE = 10;

/**
 * One status for a whole order, from its store orders' statuses. Cancelled
 * parcels are ignored unless every parcel is cancelled; the order counts as
 * delivered once every other parcel is, and as shipped once any has left.
 */
export function overallStatus(statuses: readonly OrderStatus[]): OrderStatus {
  const active = statuses.filter((status) => status !== 'CANCELLED');
  if (active.length === 0) return 'CANCELLED';
  if (active.every((status) => status === 'DELIVERED')) return 'DELIVERED';
  if (active.some((status) => status === 'SHIPPED' || status === 'DELIVERED')) {
    return 'SHIPPED';
  }
  return 'PROCESSING';
}

export type OrderSummary = {
  id: string;
  number: string;
  createdAt: Date;
  status: OrderStatus;
  /** In rupees. */
  total: number;
  itemCount: number;
  storeCount: number;
  /** Name of the first item, for "Trail Runner and 2 more". */
  firstItemName: string;
  /** Photos of up to four items; items without a photo are skipped. */
  images: { url: string; altText: string | null }[];
};

export type OrderHistory = {
  orders: OrderSummary[];
  /** The page returned, from 1. Out-of-range requests land on the last page. */
  page: number;
  pageCount: number;
  /** Every order the user has placed. */
  total: number;
};

/** One page of the user's orders, newest first. */
export async function getOrderHistory(
  userId: string,
  requestedPage: number,
): Promise<OrderHistory> {
  await connection();
  const total = await db.order.count({ where: { userId } });
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const rows = await db.order.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * ORDERS_PAGE_SIZE,
    take: ORDERS_PAGE_SIZE,
    select: {
      id: true,
      createdAt: true,
      totalAmount: true,
      storeOrders: {
        orderBy: { id: 'asc' },
        select: {
          status: true,
          items: {
            orderBy: { id: 'asc' },
            select: {
              name: true,
              quantity: true,
              product: {
                select: {
                  images: {
                    select: { url: true, altText: true },
                    orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const orders = rows.map((order) => {
    const items = order.storeOrders.flatMap((storeOrder) => storeOrder.items);
    return {
      id: order.id,
      number: orderNumber(order.id),
      createdAt: order.createdAt,
      status: overallStatus(order.storeOrders.map((so) => so.status)),
      total: rupees(order.totalAmount),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      storeCount: order.storeOrders.length,
      firstItemName: items[0]?.name ?? 'Order',
      images: items
        .flatMap((item) => item.product?.images[0] ?? [])
        .slice(0, 4),
    };
  });

  return { orders, page, pageCount, total };
}
