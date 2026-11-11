import Link from 'next/link';
import { Suspense } from 'react';
import { BagIcon, HeartIcon, SearchIcon } from '@/components/ui/icons';
import { AccountMenu } from '@/components/layout/account-menu';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { NavLinks, primaryLinks } from '@/components/layout/nav-links';
import { Container } from '@/components/ui/container';
import { getCurrentUser } from '@/lib/authz';
import { getBagCount } from '@/lib/cart';

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

/**
 * Loads the user for the account dropdown. Uses getCurrentUser, so a
 * deleted account's leftover cookie reads as signed out.
 */
async function AccountSlot() {
  const user = await getCurrentUser();
  return (
    <AccountMenu
      user={user && { name: user.name, email: user.email, role: user.role }}
    />
  );
}

/** The bag link, with a badge counting the items in the bag. */
function BagLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={`Bag, ${count} ${count === 1 ? 'item' : 'items'}`}
      className={iconButton}
    >
      <BagIcon />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

/** Loads the bag count for the signed-in user; signed out, the bag is empty. */
async function BagSlot() {
  const user = await getCurrentUser();
  return <BagLink count={user ? await getBagCount(user.id) : 0} />;
}

/**
 * The floating glass nav. Below 1024px the links move into a Menu
 * disclosure; below 640px search drops to its own full-width row.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-4 z-20 mt-4">
      <Container>
        <nav
          aria-label="Main"
          // relative z-10: the glass blur makes the nav its own stacking
          // context, so without it the phone search row below paints over
          // the Menu and account dropdowns.
          className="glass-chrome relative z-10 flex h-16 items-center gap-2 rounded-control px-3 [--glass-blur:36px] sm:gap-4"
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
            {/* Only the account menu waits for the session, so the rest of the
                header streams first. The empty slot keeps either state from flashing. */}
            <Suspense
              fallback={<span aria-hidden="true" className="size-11" />}
            >
              <AccountSlot />
            </Suspense>
            <Suspense fallback={<BagLink count={0} />}>
              <BagSlot />
            </Suspense>
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
