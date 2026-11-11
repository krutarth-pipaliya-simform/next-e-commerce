import type { ReactNode } from 'react';

export type ProductGridProps = {
  /** The cards, usually `<ProductCard />`s. */
  children: ReactNode;
};

/** Responsive grid for product cards: 2 columns on phones, up to 4 on desktop. */
export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
