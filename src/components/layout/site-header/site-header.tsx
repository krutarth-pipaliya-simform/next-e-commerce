import Link from 'next/link';
import { Suspense } from 'react';
import {
  BagIcon,
  HeartIcon,
  SearchIcon,
  UserIcon,
} from '@/components/ui/icons';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { NavLinks, primaryLinks } from '@/components/layout/nav-links';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/auth';

const iconButton =
  'relative flex size-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-white/70';

function SearchForm({ id }: { id: string }) {
  return (
    <form action="/search" role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search products, stores, brands
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search products, stores, brands"
        className="h-11 w-full rounded-control border border-hairline bg-white/70 pr-4 pl-10 text-[15px] focus:bg-white"
      />
    </form>
  );
}

/** Account icon: /dashboard when signed in, /login otherwise. */
async function AccountLink() {
  const session = await auth();
  return (
    <Link
      href={session?.user ? '/dashboard' : '/login'}
      aria-label="Account"
      className={iconButton}
    >
      <UserIcon />
    </Link>
  );
}

export type SiteHeaderProps = {
  /**
   * Items in the bag, shown as a badge on the bag icon.
   * @default 0
   */
  cartCount?: number;
};

/**
 * The floating glass nav. Below 1024px the links move into a Menu
 * disclosure; below 640px search drops to its own full-width row.
 * Pass cartCount once the cart count is fetched in the layout.
 */
export function SiteHeader({ cartCount = 0 }: SiteHeaderProps) {
  return (
    <header className="sticky top-4 z-20 mt-4">
      <Container>
        <nav
          aria-label="Main"
          className="glass-chrome flex h-16 items-center gap-2 rounded-control px-3 [--glass-blur:36px] sm:gap-4"
        >
          <MobileMenu links={primaryLinks} buttonClassName={iconButton} />

          <Link
            href="/"
            className="flex items-center gap-1.5 px-1 font-display text-[28px] leading-none tracking-[-0.02em]"
          >
            Daylight
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" />
          </Link>

          <NavLinks />

          <div className="ml-auto hidden w-full max-w-sm sm:block">
            <SearchForm id="site-search" />
          </div>

          <div className="ml-auto flex items-center sm:ml-0">
            <Link
              href="/dashboard/wishlist"
              aria-label="Wishlist"
              className={`${iconButton} hidden sm:flex`}
            >
              <HeartIcon />
            </Link>
            {/* Only the account link waits for the session, so the rest of the header streams first. */}
            <Suspense
              fallback={
                <Link href="/login" aria-label="Account" className={iconButton}>
                  <UserIcon />
                </Link>
              }
            >
              <AccountLink />
            </Suspense>
            <Link
              href="/cart"
              aria-label={`Bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              className={iconButton}
            >
              <BagIcon />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex size-[18px] items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Blur what scrolls under the phone search row, like the nav above it. */}
        <div className="mt-2 rounded-control backdrop-blur-[36px] backdrop-saturate-[1.8] sm:hidden">
          <SearchForm id="site-search-mobile" />
        </div>
      </Container>
    </header>
  );
}
