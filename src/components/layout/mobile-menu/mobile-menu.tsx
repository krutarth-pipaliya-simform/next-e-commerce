'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MenuIcon } from '@/components/ui/icons';

export type MobileMenuProps = {
  /** Links listed in the menu, in order. */
  links: readonly { href: string; label: string }[];
  /** Classes for the Menu button, so it matches the header's icon buttons. */
  buttonClassName: string;
};

/**
 * The header's Menu disclosure below 1024px. Built on <details>, so it
 * opens without JavaScript; once hydrated it also closes after a
 * navigation, on Escape, and on a tap outside it.
 */
export function MobileMenu({ links, buttonClassName }: MobileMenuProps) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  // The header lives in a layout that survives navigation, so close the
  // menu whenever the route changes.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function close(event: KeyboardEvent | PointerEvent) {
      const details = menu.current;
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

  return (
    <details ref={menu} className="group relative lg:hidden">
      <summary
        className={`${buttonClassName} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        <MenuIcon />
        <span className="sr-only">Menu</span>
      </summary>
      <ul className="glass-text absolute top-14 left-0 flex w-56 flex-col gap-1 rounded-panel p-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-11 items-center rounded-control px-3 font-medium hover:bg-sunken"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
