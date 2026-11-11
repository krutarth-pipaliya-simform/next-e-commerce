'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { addToCart } from '@/actions/cart';
import { useBagUndo, type RemovedLine } from '@/components/cart/bag-undo';
import { CheckIcon, XIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type RemovalToastProps = {
  /** Extra classes, e.g. spacing above it. */
  className?: string;
};

/**
 * "Removed X" with Undo, shown after a line leaves the bag. Undo adds the
 * same item back. It stays until it's dismissed or something else is removed.
 */
export function RemovalToast({ className }: RemovalToastProps) {
  const { removed, setRemoved } = useBagUndo();
  if (!removed) return null;
  // Keyed by the line, so each removal starts with a fresh toast.
  return (
    <Toast
      key={removed.lineId}
      removed={removed}
      onDone={() => setRemoved(null)}
      className={className}
    />
  );
}

function Toast({
  removed,
  onDone,
  className,
}: {
  removed: RemovedLine;
  onDone: () => void;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const undoRef = useRef<HTMLButtonElement>(null);

  // The Remove button that had focus is gone, so focus moves to Undo.
  useEffect(() => {
    undoRef.current?.focus();
  }, []);

  function handleUndo() {
    setError('');
    startTransition(async () => {
      const response = await addToCart(
        removed.productId,
        removed.variantId,
        removed.quantity,
      );
      if (response.error === 'Unauthorized') {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (response.error) {
        setError(`Couldn't put it back. ${response.error}`);
        return;
      }
      onDone();
    });
  }

  return (
    <div
      className={cn(
        'glass-chrome flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-control py-1.5 pr-1.5 pl-5',
        className,
      )}
    >
      <p
        role="status"
        className={cn(
          'flex items-center gap-2.5 text-[15px] font-medium',
          error && 'text-sale',
        )}
      >
        {!error && (
          <CheckIcon width={18} height={18} className="flex-none text-stock" />
        )}
        {error || `Removed ${removed.name} from your bag`}
      </p>
      <span className="flex items-center gap-0.5">
        <button
          ref={undoRef}
          type="button"
          onClick={handleUndo}
          disabled={pending}
          aria-busy={pending}
          className="h-11 rounded-control px-4 text-sm font-semibold text-accent hover:bg-white/70 disabled:cursor-progress disabled:opacity-60"
        >
          {pending ? 'Putting it back…' : 'Undo'}
        </button>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDone}
          className="grid size-11 place-items-center rounded-control hover:bg-white/70"
        >
          <XIcon width={18} height={18} />
        </button>
      </span>
    </div>
  );
}
