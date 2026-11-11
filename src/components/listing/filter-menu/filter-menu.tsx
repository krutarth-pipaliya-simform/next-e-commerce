'use client';

import Link from 'next/link';
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useDetailsDismiss } from '@/lib/use-details-dismiss';

export type FilterMenuOption = {
  /** Text shown in the menu. */
  label: string;
  /** The listing URL with this option applied. */
  href: string;
  /** True for the option in effect. */
  selected: boolean;
};

export type FilterMenuProps = {
  /** What the menu filters, e.g. "Category". */
  label: string;
  /** The current choice, shown after the label, e.g. "All". */
  value: string;
  /** Outlines the pill when the filter narrows the list. */
  active?: boolean;
  /** The choices, each a link to the filtered listing. */
  options: FilterMenuOption[];
  /**
   * Which edge of the pill the panel lines up with from 640px up.
   * @default 'start'
   */
  align?: 'start' | 'end';
};

/**
 * A filter pill that opens a list of links, one per choice. Built on
 * <details> and links, so it works before hydration. Below 640px the panel
 * is positioned against the filter bar (the nearest positioned ancestor),
 * so the bar's horizontally scrolling row doesn't clip it.
 */
export function FilterMenu({
  label,
  value,
  active = false,
  options,
  align = 'start',
}: FilterMenuProps) {
  const menu = useDetailsDismiss();

  return (
    <details ref={menu} className="group sm:relative">
      <summary
        className={cn(
          'flex h-11 list-none items-center gap-2 rounded-control border border-hairline bg-surface pr-3.5 pl-4.5 text-sm whitespace-nowrap text-muted transition-colors hover:bg-ground [&::-webkit-details-marker]:hidden',
          active && 'shadow-[inset_0_0_0_1px_var(--color-ink)]',
        )}
      >
        {label}
        <span className="font-semibold text-ink">{value}</span>
        <ChevronDownIcon
          width={16}
          height={16}
          className="text-ink transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      {/* Filter links only change the query string, so the hook's
          close-on-route-change doesn't fire; close on the click instead. */}
      <ul
        aria-label={label}
        onClick={(event) => {
          event.currentTarget.closest('details')?.removeAttribute('open');
        }}
        className={cn(
          'absolute inset-x-2 top-full z-30 mt-2 flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto rounded-control border border-hairline bg-surface p-1.5 shadow-[0_18px_44px_rgb(17_18_20/0.12),0_1px_2px_rgb(17_18_20/0.06)] sm:inset-x-auto sm:max-h-96 sm:min-w-58',
          align === 'end' ? 'sm:right-0' : 'sm:left-0',
        )}
      >
        {options.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              scroll={false}
              aria-current={option.selected ? 'true' : undefined}
              className={cn(
                'flex h-11 items-center justify-between gap-4 rounded-chip pr-3 pl-3.5 text-sm whitespace-nowrap text-ink hover:bg-ink/6',
                option.selected && 'bg-ink/6 font-semibold',
              )}
            >
              {option.label}
              {option.selected && (
                <CheckIcon width={16} height={16} strokeWidth={2.2} />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
