'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { primaryLinks } from './primary-links';
import { cn } from '@/lib/utils';

/** Header links. The current section gets an opaque white pill. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {primaryLinks.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center rounded-control px-4 text-[15px] font-medium transition-colors',
                active
                  ? 'border border-hairline bg-surface text-ink'
                  : 'text-body hover:text-ink',
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
