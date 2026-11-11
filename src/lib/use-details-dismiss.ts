'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * For a <details> used as a dropdown in a layout that survives navigation:
 * closes it after a route change, on Escape (returning focus to its
 * <summary>), and on a pointer press outside it. Attach the returned ref
 * to the <details>.
 */
export function useDetailsDismiss() {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function close(event: KeyboardEvent | PointerEvent) {
      const details = ref.current;
      if (!details?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        details.open = false;
        details.querySelector('summary')?.focus();
        return;
      }
      if (!details.contains(event.target as Node)) details.open = false;
    }
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, []);

  return ref;
}
