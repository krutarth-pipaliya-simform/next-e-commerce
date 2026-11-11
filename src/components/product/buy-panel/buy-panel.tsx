'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type CSSProperties } from 'react';
import { addToCart } from '@/actions/cart';
import { Rating } from '@/components/product/rating';
import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
  SealIcon,
  TruckIcon,
} from '@/components/ui/icons';
import type { ProductVariantOption } from '@/lib/catalog';
import { colourHex } from '@/lib/colours';
import { cn, formatPrice } from '@/lib/utils';
import {
  colourStock,
  findVariant,
  initialSelection,
  MAX_QUANTITY,
  selectColour,
  stockStatus,
  type Selection,
  type StockTone,
} from './variant-selection';

export type BuyPanelProps = {
  /** Product id, passed to `addToCart`. */
  productId: string;
  /** Product name, the page's `<h1>`. */
  name: string;
  /** Base price as a decimal string; a variant's `priceDiff` is added to it. */
  price: string;
  /** The selling store; links to the seller card further down the page. */
  store: { name: string; verified: boolean };
  /** Average rating and review count. The rating row hides with no reviews. */
  rating: { average: number; count: number };
  /** Every variant. Empty for a product sold without options. */
  variants: ProductVariantOption[];
  /** Colours on offer; `value` matches the variants' lower-case colour. */
  colours: { value: string; label: string }[];
  /** Sizes on offer, in size order; `value` matches the variants' lower-case size. */
  sizes: { value: string; label: string }[];
};

const toneText: Record<StockTone, string> = {
  in: 'text-stock',
  low: 'text-sale',
  out: 'text-sale',
};

const toneDot: Record<StockTone, string> = {
  in: 'bg-stock',
  low: 'bg-sale',
  out: 'bg-sale',
};

const optionRing = (selected: boolean) =>
  selected
    ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]'
    : 'shadow-[inset_0_0_0_1px_var(--color-divider)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]';

/**
 * The glass buy panel beside the gallery: store, name, rating, price,
 * colour and size pickers, stock, quantity and Add to bag. Signed-out
 * shoppers are sent to /login and back, since addToCart returns
 * { error: 'Unauthorized' }.
 */
export function BuyPanel({
  productId,
  name,
  price,
  store,
  rating,
  variants,
  colours,
  sizes,
}: BuyPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selection, setSelection] = useState<Selection>(() =>
    initialSelection(variants),
  );
  const [requestedQuantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<'added' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const hasVariants = variants.length > 0;
  const variant = findVariant(variants, selection);
  const stock = hasVariants ? (variant?.stock ?? 0) : undefined;
  const status = stock === undefined ? undefined : stockStatus(stock);
  const maxQuantity = Math.max(
    1,
    Math.min(stock ?? MAX_QUANTITY, MAX_QUANTITY),
  );
  const unitPrice = Number(price) + Number(variant?.priceDiff ?? 0);
  const soldOut = hasVariants && (!variant || variant.stock <= 0);
  const colourLabel = colours.find((c) => c.value === selection.color)?.label;
  const sizeLabel = sizes.find((s) => s.value === selection.size)?.label;

  // A pick with less stock caps the quantity without losing what was asked for.
  const quantity = Math.min(requestedQuantity, maxQuantity);

  // "Added" is a short confirmation; the button goes back to Add to bag.
  useEffect(() => {
    if (result !== 'added') return;
    const timer = setTimeout(() => setResult(null), 4000);
    return () => clearTimeout(timer);
  }, [result]);

  function pick(next: Selection) {
    setSelection(next);
    setResult(null);
  }

  function handleAdd() {
    // Empty the live region first, so a second identical message is announced again.
    setMessage('');
    setResult(null);
    startTransition(async () => {
      const response = await addToCart(
        productId,
        variant?.id ?? null,
        quantity,
      );
      if (response.error === 'Unauthorized') {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (response.error) {
        setResult('error');
        setMessage(`Couldn't add ${name}. ${response.error}`);
        return;
      }
      const options = [colourLabel, sizeLabel].filter(Boolean).join(', ');
      setResult('added');
      setMessage(
        `Added ${quantity} × ${name}${options ? ` (${options})` : ''} to your bag`,
      );
      router.refresh();
    });
  }

  return (
    <aside
      aria-label={`Buy ${name}`}
      className="glass-text flex flex-col gap-5 rounded-panel p-5 sm:p-7 lg:sticky lg:top-28"
    >
      <a
        href="#seller"
        className="inline-flex min-h-7 items-center gap-1.5 self-start text-sm font-medium text-ink"
      >
        {store.name}
        {store.verified && (
          <>
            <SealIcon width={14} height={14} />
            <span className="font-normal text-muted">Verified store</span>
          </>
        )}
      </a>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(36px,3.9vw,56px)] leading-none tracking-[-0.02em]">
          {name}
        </h1>
        {rating.count > 0 && (
          <a href="#reviews" className="self-start py-1 hover:underline">
            <Rating {...rating} />
          </a>
        )}
      </div>

      <p className="text-[30px] font-semibold tracking-[-0.01em] tabular-nums">
        {formatPrice(unitPrice)}
      </p>

      {colours.length > 0 && (
        <fieldset className="min-w-0">
          <legend className="mb-2.5 text-sm font-medium">
            Colour{' '}
            {colourLabel && (
              <span className="font-normal text-body">{colourLabel}</span>
            )}
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {colours.map((colour) => {
              const selected = colour.value === selection.color;
              const colourStatus = stockStatus(
                colourStock(variants, colour.value),
              );
              const hex = colourHex(colour.value);
              return (
                <button
                  key={colour.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    pick(selectColour(variants, selection, colour.value))
                  }
                  className={cn(
                    'flex h-14 min-w-0 items-center gap-3 rounded-control bg-surface pr-3.5 pl-2.5 text-left transition-shadow',
                    optionRing(selected),
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-9 flex-none rounded-full shadow-[inset_0_0_0_1px_var(--color-hairline)]',
                      hex ? 'bg-(--swatch)' : 'bg-sunken',
                    )}
                    style={
                      hex ? ({ '--swatch': hex } as CSSProperties) : undefined
                    }
                  />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[15px] font-medium">
                      {colour.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs',
                        colourStatus.tone === 'in'
                          ? 'text-muted'
                          : toneText[colourStatus.tone],
                      )}
                    >
                      {colourStatus.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="min-w-0">
          <legend className="mb-2.5 text-sm font-medium">
            Size{' '}
            {sizeLabel && (
              <span className="font-normal text-body">{sizeLabel}</span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const option = findVariant(variants, {
                color: selection.color,
                size: size.value,
              });
              const selected = size.value === selection.size;
              const outOfStock = !option || option.stock <= 0;
              return (
                <button
                  key={size.value}
                  type="button"
                  aria-pressed={selected}
                  // Sizes this colour doesn't come in can't be picked.
                  disabled={!option}
                  onClick={() => pick({ ...selection, size: size.value })}
                  className={cn(
                    'h-12 min-w-14 rounded-control bg-surface px-4 text-[15px] font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-40',
                    optionRing(selected),
                    outOfStock && 'text-muted line-through',
                  )}
                >
                  {size.label}
                  {outOfStock && <span className="sr-only">, sold out</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {status && (
        <p
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            toneText[status.tone],
          )}
        >
          <span
            aria-hidden="true"
            className={cn('size-2 rounded-full', toneDot[status.tone])}
          />
          {status.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <div
          role="group"
          aria-label="Quantity"
          className="flex h-14 flex-none items-center rounded-control bg-surface px-1.5 shadow-[inset_0_0_0_1px_var(--color-divider)]"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || soldOut}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="grid size-11 place-items-center rounded-control hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MinusIcon width={18} height={18} />
          </button>
          <output
            aria-live="polite"
            className="min-w-6 text-center font-semibold tabular-nums"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= maxQuantity || soldOut}
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="grid size-11 place-items-center rounded-control hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon width={18} height={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || soldOut}
          aria-busy={pending}
          className={cn(
            'inline-flex h-14 flex-[1_1_180px] items-center justify-center gap-2 rounded-control bg-ink px-5 font-semibold text-white tabular-nums transition-colors hover:bg-ink-hover disabled:opacity-60',
            pending ? 'cursor-progress' : 'disabled:cursor-not-allowed',
          )}
        >
          {result === 'added' && <CheckIcon width={18} height={18} />}
          {soldOut
            ? 'Sold out'
            : pending
              ? 'Adding…'
              : result === 'added'
                ? 'Added to bag'
                : `Add to bag · ${formatPrice(unitPrice * quantity)}`}
        </button>
      </div>

      {/* Kept in the page while empty (sr-only takes it out of the layout), so screen readers announce what gets added. */}
      <p role="status" className="-mt-2 text-sm empty:sr-only">
        {message && (
          <span className={result === 'error' ? 'text-sale' : 'text-body'}>
            {message}
            {result === 'added' && (
              <>
                {' '}
                <Link
                  href="/cart"
                  className="font-medium text-accent hover:underline"
                >
                  View bag
                </Link>
              </>
            )}
          </span>
        )}
      </p>

      <ul className="rounded-control bg-surface px-4.5 py-1 shadow-[0_0_0_1px_var(--color-hairline)]">
        <li className="flex items-start gap-3.5 border-b border-hairline py-3.5">
          <TruckIcon className="mt-0.5 flex-none" />
          <div>
            <p className="text-[15px] font-medium">Free shipping over ₹999</p>
            <p className="mt-0.5 text-[13px] leading-[1.45] text-muted">
              Counts across every store in one order.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3.5 py-3.5">
          <ReturnIcon className="mt-0.5 flex-none" />
          <div>
            <p className="text-[15px] font-medium">30-day returns</p>
            <p className="mt-0.5 text-[13px] leading-[1.45] text-muted">
              Send anything back for free within 30 days.
            </p>
          </div>
        </li>
      </ul>
    </aside>
  );
}
