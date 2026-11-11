import Link from 'next/link';
import { HomeSection } from '@/components/home/home-section';
import { CheckIcon, SealIcon } from '@/components/ui/icons';

const perks = [
  'Keep 92% of every sale',
  'Store review within 3 working days',
  'Payouts every Friday',
];

/** Dark "open your store" panel at the end of the home page. */
export function SellBanner() {
  return (
    <HomeSection id="sell-heading" space="m">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-10 rounded-panel bg-ink p-[clamp(24px,4vw,48px)] text-white">
        <div className="flex max-w-[540px] flex-col gap-6">
          <h2
            id="sell-heading"
            className="font-display text-[clamp(36px,4.6vw,64px)] leading-none tracking-[-0.02em]"
          >
            Open your store on Daylight.
          </h2>
          <p className="text-[17px] leading-relaxed text-on-ink-muted">
            Bring what you make to buyers who came looking for colour. You set
            the prices and ship your own orders; we handle payments, returns and
            the storefront.
          </p>
          <ul className="flex flex-col gap-2.5 text-[15px] text-on-ink">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <CheckIcon width={18} height={18} />
                {perk}
              </li>
            ))}
          </ul>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href="/sell"
              className="inline-flex h-[52px] items-center rounded-control bg-white px-6.5 font-medium text-ink transition-colors hover:bg-on-ink"
            >
              Apply to sell
            </Link>
            <Link
              href="/help"
              className="inline-flex h-[52px] items-center rounded-control border border-white/30 px-6 font-medium transition-colors hover:bg-white/10"
            >
              How selling works
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="stage relative flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-stage p-8 text-ink"
        >
          <SealIcon width={72} height={72} />
          <p className="text-center font-display text-[32px] leading-none tracking-[-0.02em]">
            Verified by Daylight
          </p>
          <p className="max-w-[260px] text-center text-sm text-body">
            Every store gets the seal once our team approves it.
          </p>
        </div>
      </div>
    </HomeSection>
  );
}
