import Link from 'next/link';
import { Container } from '@/components/ui/container';

const columns = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All products' },
      { href: '/stores', label: 'Stores' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    title: 'Sell on Daylight',
    links: [
      { href: '/sell', label: 'Open a store' },
      { href: '/seller', label: 'Seller dashboard' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { href: '/dashboard', label: 'Orders' },
      { href: '/dashboard/wishlist', label: 'Wishlist' },
      { href: '/cart', label: 'Bag' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface max-sm:mt-14">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
          <Link
            href="/"
            className="font-display text-[32px] leading-none tracking-[-0.02em]"
          >
            Daylight
          </Link>
          <p className="max-w-xs text-[15px] text-body">
            Colourful things from independent stores. One bag, one checkout,
            shipped by each store.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
            <ul className="mt-3 flex flex-col">
              {column.links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex min-h-11 items-center text-[15px] text-body hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-hairline py-6 text-[13px] text-muted">
        © {new Date().getFullYear()} Daylight. Payments are simulated; no real
        charge is made.
      </Container>
    </footer>
  );
}
