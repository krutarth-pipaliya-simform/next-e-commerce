import type { ReactNode } from 'react';

export type ProductCardProps = {
  /** Product id; the card links to `/product/[id]`. */
  id: string;
  /** Product name. */
  name: string;
  /** Base price. Accepts a Prisma `Decimal` through its `toString()`. */
  price: number | string | { toString(): string };
  /** Main image. Without one the stage shows "No image yet". */
  image?: { url: string; altText?: string | null };
  /** The selling store; its name links to `/stores/[slug]`. */
  store: {
    /** Store name. */
    name: string;
    /** Store slug, for the store link. */
    slug: string;
    /** Shows the verified seal next to the name. */
    verified?: boolean;
  };
  /** Average rating and review count. Hidden when there are no reviews. */
  rating?: { average: number; count: number };
  /** The product's main colour. Glass over the image picks up a wash of it. */
  tint?: string;
  /** Short label on the image, e.g. "New", "−20%", "Low stock". */
  label?: string;
  /** Rendered at the bottom of the image, e.g. `<QuickAddButton />`. */
  quickAdd?: ReactNode;
  /** Rendered top-right on the image, e.g. a save-to-wishlist button. */
  saveButton?: ReactNode;
};
