'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { addToCart } from '@/actions/cart';
import { CheckIcon, PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * "Quick add" for products without variants. Signed-out shoppers are
 * sent to /login (and back here afterwards), since addToCart returns
 * { error: 'Unauthorized' }.
 */
export type QuickAddButtonProps = {
  /** The product to add, with no variant. */
  productId: string;
  /** Used in the button's accessible name and the "added" message. */
  productName: string;
};

export function QuickAddButton({
  productId,
  productName,
}: QuickAddButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<'added' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  // "Added" is a short confirmation; the button goes back to Quick add.
  useEffect(() => {
    if (result !== 'added') return;
    const timer = setTimeout(() => setResult(null), 2500);
    return () => clearTimeout(timer);
  }, [result]);

  function handleClick() {
    // Empty the live region first, so a second identical message is announced again.
    setMessage('');
    setResult(null);
    startTransition(async () => {
      const response = await addToCart(productId);
      if (response.error === 'Unauthorized') {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (response.error) {
        setResult('error');
        setMessage(`Couldn't add ${productName}. ${response.error}`);
        return;
      }
      setResult('added');
      setMessage(`${productName} added to bag`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          'glass-adaptive flex h-11 w-full items-center justify-center gap-1.5 rounded-control text-sm font-semibold disabled:opacity-60',
          result === 'error' ? 'text-sale' : 'text-ink',
        )}
      >
        {result === 'added' ? (
          <CheckIcon width={16} height={16} />
        ) : (
          <PlusIcon width={16} height={16} />
        )}
        {pending
          ? 'Adding…'
          : result === 'added'
            ? 'Added to bag'
            : result === 'error'
              ? "Couldn't add, try again"
              : 'Quick add'}
        <span className="sr-only">: {productName}</span>
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
