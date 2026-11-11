'use client';

import Link from 'next/link';
import { MenuIcon } from '@/components/ui/icons';
import { useDetailsDismiss } from '@/lib/use-details-dismiss';

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
  const menu = useDetailsDismiss();

  return (
    <details ref={menu} className="group relative lg:hidden">
      <summary
        className={`${buttonClassName} list-none [&::-webkit-details-marker]:hidden`}
      >
        <MenuIcon />
        <span className="sr-only">Menu</span>
      </summary>
      <ul className="absolute top-14 left-0 flex w-56 flex-col gap-1 rounded-panel border border-hairline bg-surface shadow-[0_18px_44px_rgb(17_18_20/0.12),0_1px_2px_rgb(17_18_20/0.06)] p-2">
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
