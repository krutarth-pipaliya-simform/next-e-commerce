'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addToCart } from '@/actions/cart';
import { PlusIcon } from '@/components/ui/icons';

/**
 * "Quick add" for products without variants. Signed-out shoppers are
 * sent to /login, since addToCart returns { error: 'Unauthorized' }.
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
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId);
      if (result.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      setMessage(result.error ?? `${productName} added to bag`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={`Quick add ${productName}`}
        className="glass-adaptive flex h-11 w-full items-center justify-center gap-1.5 rounded-control text-sm font-semibold text-ink disabled:opacity-60"
      >
        <PlusIcon width={16} height={16} />
        {pending ? 'Adding…' : 'Quick add'}
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
