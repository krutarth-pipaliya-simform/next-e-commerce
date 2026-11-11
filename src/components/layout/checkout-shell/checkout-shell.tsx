import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { ChevronRightIcon, LockIcon } from '@/components/ui/icons';

export type CheckoutShellProps = {
  /** The checkout page. */
  children: ReactNode;
};

const steps = [
  { href: '#address', label: 'Address' },
  { href: '#delivery', label: 'Delivery' },
  { href: '#payment', label: 'Payment' },
];

/**
 * Checkout's own frame: a glass header with only the wordmark, links to the
 * three steps and Back to bag, so nothing pulls the shopper away mid-checkout.
 * The steps link to the form's sections; all three sit on one page.
 */
export function CheckoutShell({ children }: CheckoutShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-4 z-20 mt-4">
        <Container>
          <div className="glass-chrome flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-control py-1.5 pr-2 pl-4 [--glass-blur:36px] sm:pl-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 py-2 font-display text-[28px] leading-none tracking-[-0.02em]"
            >
              Daylight
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-ink"
              />
            </Link>

            <nav
              aria-label="Checkout steps"
              className="order-last w-full border-t border-hairline pt-1 md:order-none md:w-auto md:border-0 md:pt-0"
            >
              <ol className="flex items-center justify-between gap-1">
                {steps.map((step, index) => (
                  <li key={step.href} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRightIcon
                        width={16}
                        height={16}
                        className="hidden text-muted sm:block"
                      />
                    )}
                    <a
                      href={step.href}
                      className="inline-flex h-11 items-center gap-2 rounded-control px-2.5 text-sm font-medium text-body hover:bg-white/70 hover:text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-6 flex-none place-items-center rounded-full bg-ink text-xs font-semibold text-white"
                      >
                        {index + 1}
                      </span>
                      {step.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="flex items-center gap-1">
              <span className="hidden items-center gap-2 px-2 text-sm font-medium sm:inline-flex">
                <LockIcon width={18} height={18} />
                Secure checkout
              </span>
              <Link
                href="/cart"
                className="inline-flex h-11 items-center rounded-control px-3.5 text-sm font-medium text-body hover:bg-white/70 hover:text-ink"
              >
                Back to bag
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="mt-16 border-t border-hairline bg-surface sm:mt-24">
        <Container className="py-6 text-[13px] text-muted">
          © {new Date().getFullYear()} Daylight. Payments are simulated; no real
          charge is made.
        </Container>
      </footer>
    </div>
  );
}
