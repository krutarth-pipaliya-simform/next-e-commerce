import type { ComponentType } from 'react';
import type { IconProps } from '@/components/ui/icons';

type IntentOptionProps = {
  value: 'shop' | 'sell';
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  checked: boolean;
  onSelect: () => void;
};

/** One card of the "How will you use Daylight?" radio group. */
export function IntentOption({
  value,
  title,
  description,
  icon: Icon,
  checked,
  onSelect,
}: IntentOptionProps) {
  return (
    <label className="flex min-h-11 items-center gap-3.5 rounded-card bg-surface p-4 ring-1 ring-divider ring-inset has-[:checked]:shadow-[0_8px_24px_rgb(17_18_20/0.08)] has-[:checked]:ring-2 has-[:checked]:ring-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
      <input
        type="radio"
        name="intent"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-ink peer-checked:bg-ink peer-checked:text-white"
      >
        <Icon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-ink">{title}</span>
        <span className="text-[13px] text-muted">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className="size-5 shrink-0 rounded-full border-[1.5px] border-ink/35 peer-checked:border-[6px] peer-checked:border-ink"
      />
    </label>
  );
}
