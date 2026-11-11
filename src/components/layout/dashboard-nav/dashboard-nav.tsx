'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type DashboardNavItem = {
  /** Route the link opens. */
  href: string;
  /** Link text. */
  label: string;
  /** e.g. "4 to ship" or "3" */
  badge?: string;
};

/**
 * Sidebar links. The active item gets the ink fill. Below 1024px the
 * list becomes a horizontal scroll strip above the content.
 */
export type DashboardNavProps = {
  /** Links, in order. */
  items: DashboardNavItem[];
  /** The overview route, matched exactly so it isn't active on every child page. */
  rootHref: string;
};

export function DashboardNav({ items, rootHref }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] max-lg:-mx-1 max-lg:px-1 lg:flex-col [&::-webkit-scrollbar]:hidden">
      {items.map(({ href, label, badge }) => {
        const active =
          href === rootHref
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center gap-3 rounded-control px-3 text-[15px] font-medium whitespace-nowrap transition-colors',
                active ? 'bg-ink text-white' : 'text-ink hover:bg-sunken',
              )}
            >
              {label}
              {badge && (
                <span
                  className={cn(
                    'ml-auto rounded-chip px-2 py-0.5 text-xs font-semibold',
                    active ? 'bg-white/15 text-white' : 'bg-sunken text-body',
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
