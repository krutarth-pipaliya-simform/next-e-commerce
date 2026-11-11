import { HomeSection } from '@/components/home/home-section';
import {
  ReturnIcon,
  SealIcon,
  ShieldIcon,
  TruckIcon,
} from '@/components/ui/icons';

const values = [
  {
    icon: TruckIcon,
    title: 'Free shipping over $50',
    text: 'Counts across every store in one order.',
  },
  {
    icon: ReturnIcon,
    title: '30-day returns',
    text: 'Send anything back for free within 30 days.',
  },
  {
    icon: ShieldIcon,
    title: 'Buyer protection',
    text: "Full refund if an order never arrives or isn't as described.",
  },
  {
    icon: SealIcon,
    title: 'Verified sellers',
    text: 'Our team reviews every store before it can sell.',
  },
];

export function ValueBand() {
  return (
    <HomeSection label="Why shop on Daylight">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-8 rounded-panel bg-surface p-8 shadow-[0_1px_2px_rgb(17_18_20/0.04)]">
        {values.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="grid size-12 flex-none place-items-center rounded-control bg-sunken text-ink"
            >
              <Icon width={22} height={22} className="text-ink" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-normal text-body">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
