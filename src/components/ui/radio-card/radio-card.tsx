import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type RadioCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  /** `name` of the radio group the card belongs to. */
  name: string;
  /** Value submitted with the form when this card is picked. */
  value: string;
  /** The card's text: a title and any detail lines. */
  children: ReactNode;
  /** Shown at the right edge, e.g. a price or an icon. */
  aside?: ReactNode;
  /** Extra classes for the card. */
  className?: string;
};

/**
 * A native radio drawn as a white card, with the dot on the left. The ring
 * thickens around the picked card. Group cards in a `<fieldset>` with a
 * `<legend>` so screen readers announce what is being chosen.
 */
export function RadioCard({
  name,
  value,
  children,
  aside,
  className,
  ...props
}: RadioCardProps) {
  return (
    <label
      className={cn(
        'flex min-h-[72px] items-start gap-3 rounded-control bg-surface px-4 py-3.5 text-left ring-1 ring-divider transition-shadow ring-inset',
        'has-checked:shadow-[0_8px_24px_rgb(17_18_20/0.08)] has-checked:ring-2 has-checked:ring-ink',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
        'has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className="mt-px size-5 flex-none rounded-full border-[1.5px] border-ink/35 bg-surface transition-[border-width] peer-checked:border-[6px] peer-checked:border-ink"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm leading-normal text-body">
        {children}
      </span>
      {aside}
    </label>
  );
}
