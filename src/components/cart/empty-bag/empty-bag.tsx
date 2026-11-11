import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { HeartIcon, TruckIcon } from '@/components/ui/icons';
import { FREE_SHIPPING_MIN } from '@/lib/cart-rules';
import { cn, formatPrice } from '@/lib/utils';

export type EmptyBagProps = {
  /** Extra classes, e.g. spacing above it. */
  className?: string;
};

/** The bag with nothing in it: an empty-bag drawing, and links to the shop and wishlist. */
export function EmptyBag({ className }: EmptyBagProps) {
  return (
    <section
      aria-labelledby="empty-bag"
      className={cn(
        'flex flex-wrap gap-3 rounded-panel bg-surface p-3 shadow-[0_1px_2px_rgb(17_18_20/0.04)]',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="stage grid aspect-[16/10] max-h-100 min-w-0 flex-[1_1_420px] place-items-center rounded-stage"
      >
        <svg viewBox="0 0 240 200" className="h-auto w-[min(300px,70%)]">
          <ellipse cx="120" cy="182" rx="70" ry="6" className="fill-ink/10" />
          <path
            d="M58 66h124l-10 112H68z"
            className="fill-surface stroke-ink/20"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M58 66h124l-1.4 16H59.4z" className="fill-ink/5" />
          <path
            d="M94 66V52a26 26 0 0 1 52 0v14"
            fill="none"
            className="stroke-ink/50"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="94" cy="78" r="4" className="fill-ink/50" />
          <circle cx="146" cy="78" r="4" className="fill-ink/50" />
          <path
            d="M104 124c5 6 27 6 32 0"
            fill="none"
            className="stroke-ink/25"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex min-w-0 flex-[1_1_420px] flex-col justify-center gap-5 p-5 sm:p-12">
        <h2
          id="empty-bag"
          className="font-display text-[clamp(32px,5vw,56px)] leading-none tracking-[-0.02em]"
        >
          Your bag is <em>empty</em>
        </h2>
        <p className="max-w-[46ch] text-base leading-[1.6] text-body">
          When you add something, it shows up here grouped by the store that
          ships it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className={buttonClasses()}>
            Start shopping
          </Link>
          <Link
            href="/dashboard/wishlist"
            className={buttonClasses({ variant: 'secondary' })}
          >
            <HeartIcon width={18} height={18} />
            View wishlist
          </Link>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <TruckIcon width={18} height={18} className="flex-none" />
          Orders over {formatPrice(FREE_SHIPPING_MIN)} ship free, across every
          store.
        </p>
      </div>
    </section>
  );
}
