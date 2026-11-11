'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import { ChevronDownIcon, LogOutIcon, UserIcon } from '@/components/ui/icons';
import type { Role } from '@/generated/prisma/enums';
import { initials } from '@/lib/utils';
import { useDetailsDismiss } from '@/lib/use-details-dismiss';

export type AccountMenuUser = {
  name: string | null;
  email: string | null;
  role: Role;
};

export type AccountMenuProps = {
  /** The signed-in user, or null when signed out. */
  user: AccountMenuUser | null;
};

const triggerClasses =
  'flex h-11 items-center gap-1.5 rounded-control px-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-white/70';

const itemClasses =
  'flex h-11 items-center rounded-control px-3 text-[15px] font-medium text-ink hover:bg-sunken';

/** Links for every signed-in user, then the ones their role adds. */
function accountLinks(role: Role) {
  const links = [
    { href: '/dashboard/orders', label: 'Your orders' },
    { href: '/dashboard/wishlist', label: 'Wishlist' },
    { href: '/dashboard/settings', label: 'Profile & addresses' },
  ];
  if (role === 'SELLER')
    links.push({ href: '/seller', label: 'Seller dashboard' });
  if (role === 'SUPER_ADMIN') links.push({ href: '/admin', label: 'Admin' });
  if (role === 'CUSTOMER')
    links.push({ href: '/sell', label: 'Sell on Daylight' });
  return links;
}

/**
 * The header's account control. Signed out, a plain "Sign in" link to the
 * login page, which returns to the current page and links to sign-up.
 * Signed in, a dropdown with who you are, your account pages and Log out.
 * Built on <details>, like MobileMenu. The panel is solid, not glass: a
 * backdrop blur inside the glass nav can't reach the page behind it.
 */
export function AccountMenu({ user }: AccountMenuProps) {
  const menu = useDetailsDismiss();
  const pathname = usePathname();

  if (!user) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
        className={triggerClasses}
      >
        Sign in
      </Link>
    );
  }

  return (
    <details ref={menu} className="group relative">
      <summary
        className={`${triggerClasses} list-none [&::-webkit-details-marker]:hidden`}
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white"
        >
          {user.name ? (
            initials(user.name)
          ) : (
            <UserIcon width={18} height={18} />
          )}
        </span>
        <span className="sr-only">
          Account menu{user.name ? ` for ${user.name}` : ''}
        </span>
        <ChevronDownIcon
          width={16}
          height={16}
          className="hidden text-muted transition-transform group-open:rotate-180 sm:block"
        />
      </summary>

      <div className="absolute top-14 right-0 w-72 rounded-panel border border-hairline bg-surface p-2 shadow-[0_18px_44px_rgb(17_18_20/0.12),0_1px_2px_rgb(17_18_20/0.06)]">
        <div className="px-3 pt-2 pb-3">
          <p className="truncate font-medium text-ink">
            {user.name ?? 'Your account'}
          </p>
          {user.email && (
            <p className="truncate text-[13px] text-muted">{user.email}</p>
          )}
        </div>
        <ul className="flex flex-col gap-0.5 border-t border-hairline pt-2">
          {accountLinks(user.role).map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={itemClasses}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <form action={logout} className="mt-2 border-t border-hairline pt-2">
          <button
            type="submit"
            className={`${itemClasses} w-full gap-3 text-body hover:text-ink`}
          >
            <LogOutIcon />
            Log out
          </button>
        </form>
      </div>
    </details>
  );
}
