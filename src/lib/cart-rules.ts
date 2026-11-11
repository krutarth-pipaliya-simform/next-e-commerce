// Cart rules shared by the Server Actions, the cart page and the buy panel.
// No database access here, so client components can import it.

import type { DeliverySpeed } from '@/generated/prisma/enums';

/** At most this many of one item go in the bag at a time. */
export const MAX_QUANTITY = 10;

/** Below this many, stock shows as "Only N left". */
const LOW_STOCK = 5;

export type StockTone = 'in' | 'low' | 'out';

export function stockStatus(stock: number): { tone: StockTone; text: string } {
  if (stock <= 0) return { tone: 'out', text: 'Sold out' };
  if (stock <= LOW_STOCK) return { tone: 'low', text: `Only ${stock} left` };
  return { tone: 'in', text: 'In stock' };
}

/** Orders at or over this subtotal ship free, counted across every store. */
export const FREE_SHIPPING_MIN = 999;

/** Below FREE_SHIPPING_MIN, each store's parcel costs this to ship. */
export const SHIPPING_PER_STORE = 49;

/** Express delivery costs this much more per store parcel, on top of the standard charge. */
export const EXPRESS_FEE = 99;

/** Days from placing the order to delivery: [earliest, latest]. */
const DELIVERY_DAYS: Record<DeliverySpeed, readonly [number, number]> = {
  STANDARD: [4, 6],
  EXPRESS: [1, 2],
};

export const DELIVERY_LABEL: Record<DeliverySpeed, string> = {
  STANDARD: 'Standard',
  EXPRESS: 'Express',
};

/**
 * What one store's parcel costs to ship. `orderSubtotal` is the whole
 * order's, because free shipping counts every store.
 */
export function parcelFee(orderSubtotal: number, speed: DeliverySpeed) {
  const standard = orderSubtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_PER_STORE;
  return standard + (speed === 'EXPRESS' ? EXPRESS_FEE : 0);
}

/** Shipping for an order with standard delivery on every parcel. */
export function shippingFor(subtotal: number, storeCount: number) {
  return parcelFee(subtotal, 'STANDARD') * storeCount;
}

const arrivalDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Kolkata',
});

/** When a parcel ordered at `placedAt` should arrive, e.g. "Mon, 16 Nov – Wed, 18 Nov". */
export function deliveryWindow(speed: DeliverySpeed, placedAt: Date) {
  const day = 24 * 60 * 60 * 1000;
  const [earliest, latest] = DELIVERY_DAYS[speed].map((days) =>
    arrivalDate.format(new Date(placedAt.getTime() + days * day)),
  );
  return earliest === latest ? earliest : `${earliest} – ${latest}`;
}
