import { BagLine } from '@/components/cart/bag-line';
import type { BagLine as BagLineData } from '@/lib/cart';

export type UnavailableLinesProps = {
  /** Sold-out and unavailable lines, from `getBag`. */
  lines: BagLineData[];
};

/**
 * Lines that can't be bought right now: sold out, unpublished, from a store
 * that isn't live, or whose option was deleted. They stay in the bag (stock
 * may come back) but are left out of the totals and checkout.
 */
export function UnavailableLines({ lines }: UnavailableLinesProps) {
  if (lines.length === 0) return null;
  return (
    <section
      aria-labelledby="bag-unavailable"
      className="rounded-panel bg-surface px-4 py-2 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:px-6"
    >
      <header className="border-b border-hairline py-4">
        <h2 id="bag-unavailable" className="text-[17px] font-semibold">
          Not available right now
        </h2>
        <p className="mt-0.5 text-sm text-body">
          These aren&apos;t counted in your total and won&apos;t go to checkout.
        </p>
      </header>
      <div className="divide-y divide-hairline">
        {lines.map((line) => (
          <BagLine key={line.id} line={line} />
        ))}
      </div>
    </section>
  );
}
