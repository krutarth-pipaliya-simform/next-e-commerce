import Link from 'next/link';
import { cn } from '@/lib/utils';

export type CategoryChip = {
  /** Category name, or "All results". */
  label: string;
  /** Matching products in it. */
  count: number;
  /** The search URL narrowed to this category. */
  href: string;
  /** True for the category in effect. */
  selected: boolean;
};

export type CategoryChipsProps = {
  /** "All results" first, then each category the results fall in. */
  chips: CategoryChip[];
};

/** "In categories": a row of chips that narrow the results to one category. */
export function CategoryChips({ chips }: CategoryChipsProps) {
  return (
    <div
      role="group"
      aria-labelledby="category-chips-label"
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>*]:flex-none"
    >
      <span
        id="category-chips-label"
        className="mr-1 text-[13px] whitespace-nowrap text-muted"
      >
        In categories
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          scroll={false}
          aria-current={chip.selected ? 'true' : undefined}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-chip border px-3.5 text-sm font-medium whitespace-nowrap',
            chip.selected
              ? 'border-ink bg-ink text-white'
              : 'border-divider bg-surface text-ink hover:border-ink',
          )}
        >
          {chip.label}
          <span
            className={cn(
              'text-[13px] font-normal tabular-nums',
              chip.selected ? 'text-on-ink-muted' : 'text-muted',
            )}
          >
            {chip.count.toLocaleString('en-IN')}
          </span>
        </Link>
      ))}
    </div>
  );
}
