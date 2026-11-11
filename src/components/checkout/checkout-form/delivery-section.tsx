import type { DeliverySpeed } from '@/generated/prisma/enums';
import { RadioCard } from '@/components/ui/radio-card';
import type { BagGroup } from '@/lib/cart';
import { DELIVERY_LABEL, parcelFee } from '@/lib/cart-rules';
import { formatPrice, initials } from '@/lib/utils';
import { CheckoutSection } from './checkout-section';
import { LineThumb } from './line-thumb';

type DeliverySectionProps = {
  groups: BagGroup[];
  subtotal: number;
  /** The picked speed by store id. */
  speeds: Record<string, DeliverySpeed>;
  onSpeedChange: (storeId: string, speed: DeliverySpeed) => void;
  deliveryWindows: Record<DeliverySpeed, string>;
};

const SPEEDS: DeliverySpeed[] = ['STANDARD', 'EXPRESS'];

export const feeText = (fee: number) => (fee === 0 ? 'Free' : formatPrice(fee));

/** Step 2: each store's parcel, with its lines and a speed to pick for it. */
export function DeliverySection({
  groups,
  subtotal,
  speeds,
  onSpeedChange,
  deliveryWindows,
}: DeliverySectionProps) {
  return (
    <CheckoutSection id="delivery" number={2} title="Delivery">
      <p className="-mt-2 text-[15px] leading-normal text-body">
        {groups.length === 1
          ? 'Your order ships in one parcel. Pick a speed for it.'
          : `Your order ships in ${groups.length} parcels, one from each store. Pick a speed for each.`}
      </p>

      {groups.map((group, index) => (
        <fieldset
          key={group.store.id}
          className="flex flex-col gap-4 rounded-card p-4 ring-1 ring-divider ring-inset sm:p-5"
        >
          <legend className="sr-only">
            Delivery speed for the {group.store.name} parcel
          </legend>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 flex-none place-items-center rounded-control bg-ink text-sm font-semibold tracking-[0.02em] text-white"
              >
                {initials(group.store.name)}
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] text-muted">Ships from</span>
                <span className="text-base font-semibold">
                  {group.store.name}
                </span>
              </span>
            </div>
            {groups.length > 1 && (
              <span className="text-[13px] text-muted">
                Parcel {index + 1} of {groups.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 border-y border-hairline py-4">
            {group.lines.map((line) => (
              <LineThumb key={line.id} line={line} size="md" />
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-2.5">
            {SPEEDS.map((speed) => (
              <RadioCard
                key={speed}
                name={`speed:${group.store.id}`}
                value={speed}
                checked={speeds[group.store.id] === speed}
                onChange={() => onSpeedChange(group.store.id, speed)}
                aside={
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {feeText(parcelFee(subtotal, speed))}
                  </span>
                }
              >
                <span className="text-[15px] font-semibold text-ink">
                  {DELIVERY_LABEL[speed]}
                </span>
                <span className="text-[13px]">{deliveryWindows[speed]}</span>
              </RadioCard>
            ))}
          </div>
        </fieldset>
      ))}
    </CheckoutSection>
  );
}
