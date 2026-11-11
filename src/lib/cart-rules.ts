// Cart rules shared by the Server Actions, the cart page and the buy panel.
// No database access here, so client components can import it.

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

/** Shipping for an order: free over FREE_SHIPPING_MIN, else per store parcel. */
export function shippingFor(subtotal: number, storeCount: number) {
  if (storeCount === 0 || subtotal >= FREE_SHIPPING_MIN) return 0;
  return SHIPPING_PER_STORE * storeCount;
}
