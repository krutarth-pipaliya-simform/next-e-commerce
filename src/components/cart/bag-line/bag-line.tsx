'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import { removeFromCart, updateCartItemQuantity } from '@/actions/cart';
import { useBagUndo } from '@/components/cart/bag-undo';
import { MinusIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import type { BagLine as BagLineData } from '@/lib/cart';
import { stockStatus, type StockTone } from '@/lib/cart-rules';
import { cn, formatPrice } from '@/lib/utils';

export type BagLineProps = {
  /** The line to show, from `getBag`. */
  line: BagLineData;
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

const ghostButton =
  'inline-flex h-11 items-center gap-2 rounded-control px-3 text-sm font-medium hover:bg-sunken disabled:cursor-progress disabled:opacity-60';

/**
 * One line of the bag: photo, name, options, stock, price, a quantity
 * stepper capped at the stock (at most 10) and Remove. The stepper shows
 * the new quantity straight away while the change saves. Sold-out and
 * unavailable lines only offer Remove.
 */
export function BagLine({ line }: BagLineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setRemoved } = useBagUndo();
  const [pending, startTransition] = useTransition();
  const [quantity, setOptimisticQuantity] = useOptimistic(line.quantity);
  const [error, setError] = useState('');

  const href = `/product/${line.productId}`;
  const buyable =
    line.availability === 'ok' || line.availability === 'over-stock';
  const status =
    line.availability === 'unavailable'
      ? { tone: 'out' as const, text: 'No longer available' }
      : line.stock !== null
        ? stockStatus(line.stock)
        : null;

  function run(
    action: () => Promise<{ error?: string }>,
    onSuccess?: () => void,
  ) {
    setError('');
    startTransition(async () => {
      const response = await action();
      if (response.error === 'Unauthorized') {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (response.error) {
        setError(response.error);
        return;
      }
      onSuccess?.();
    });
  }

  function changeQuantity(next: number) {
    run(() => {
      setOptimisticQuantity(next);
      return updateCartItemQuantity(line.id, next);
    });
  }

  function remove() {
    run(
      () => removeFromCart(line.id),
      () =>
        setRemoved({
          lineId: line.id,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          name: line.name,
        }),
    );
  }

  return (
    <div className="flex gap-4 py-5 sm:gap-5">
      <Link
        href={href}
        aria-hidden="true"
        tabIndex={-1}
        className={cn(
          'stage relative h-26 w-22 flex-none overflow-hidden rounded-stage shadow-[inset_0_0_0_1px_var(--color-hairline)] sm:h-36 sm:w-30',
          !buyable && 'opacity-60',
        )}
      >
        {line.image && (
          <Image
            src={line.image.url}
            alt=""
            fill
            sizes="120px"
            className="object-contain p-3"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-base leading-[1.35] font-medium">
              <Link href={href} className="hover:underline">
                {line.name}
              </Link>
            </h3>
            {line.options && (
              <span className="text-sm text-body">{line.options}</span>
            )}
            {status && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-[13px] font-medium',
                  toneText[status.tone],
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('size-1.5 rounded-full', toneDot[status.tone])}
                />
                {status.text}
              </span>
            )}
          </div>
          {buyable && (
            <div className="flex flex-col items-end gap-0.5 tabular-nums">
              <span className="text-[17px] font-semibold">
                {formatPrice(line.lineTotal)}
              </span>
              {line.quantity > 1 && (
                <span className="text-[13px] text-muted">
                  {formatPrice(line.unitPrice)} each
                </span>
              )}
            </div>
          )}
        </div>

        {line.availability === 'over-stock' && (
          <p className="text-[13px] font-medium text-sale">
            Lower the quantity to {line.stock} to check out.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {buyable && (
            <div
              role="group"
              aria-label={`Quantity of ${line.name}`}
              className="flex h-12 flex-none items-center rounded-control bg-surface px-0.5 shadow-[inset_0_0_0_1px_var(--color-divider)]"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={pending || quantity <= 1}
                onClick={() => changeQuantity(quantity - 1)}
                className="grid size-11 place-items-center rounded-control hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MinusIcon width={18} height={18} />
              </button>
              <output
                aria-live="polite"
                className="min-w-6 text-center text-[15px] font-semibold tabular-nums"
              >
                {quantity}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={pending || quantity >= line.maxQuantity}
                onClick={() => changeQuantity(quantity + 1)}
                className="grid size-11 place-items-center rounded-control hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PlusIcon width={18} height={18} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className={cn(ghostButton, 'text-body')}
          >
            <TrashIcon width={18} height={18} />
            Remove<span className="sr-only"> {line.name}</span>
          </button>
        </div>

        {/* Kept in the page while empty, so screen readers announce errors. */}
        <p role="status" className="text-[13px] text-sale empty:sr-only">
          {error && `Couldn't update ${line.name}. ${error}`}
        </p>
      </div>
    </div>
  );
}
