import type { DeliverySpeed } from '@/generated/prisma/enums';
import type { BagGroup } from '@/lib/cart';

/** A saved address the shopper can ship to. */
export type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
};

export type CheckoutFormProps = {
  /** The shopper's saved addresses, default first. Empty shows the new-address form. */
  addresses: SavedAddress[];
  /** The bag's buyable lines by store, from `getBag`. Each store ships one parcel. */
  groups: BagGroup[];
  /** Items in the bag (summed quantities). */
  itemCount: number;
  /** The bag's subtotal in rupees. Free shipping counts it across every store. */
  subtotal: number;
  /**
   * When a parcel ordered now arrives, by speed. Worked out on the server,
   * so the server and browser render the same dates.
   */
  deliveryWindows: Record<DeliverySpeed, string>;
};
