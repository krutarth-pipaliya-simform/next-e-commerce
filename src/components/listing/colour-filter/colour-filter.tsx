import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CheckIcon } from '@/components/ui/icons';
import { colourHex, contrastOn } from '@/lib/colours';
import { cn } from '@/lib/utils';

export type ColourFilterOption = {
  /** Lower-case colour name, as it appears in the URL. */
  value: string;
  /** The colour name as sellers spelled it. */
  label: string;
  /** The listing URL with this colour toggled on or off. */
  href: string;
  /** True when the colour is part of the filter. */
  selected: boolean;
};

export type ColourFilterProps = {
  /** Colours to offer, selected ones included. */
  colours: ColourFilterOption[];
};

/**
 * A row of colour swatches; each toggles its colour in the filter. Colour
 * names without a known swatch show as text pills instead.
 */
export function ColourFilter({ colours }: ColourFilterProps) {
  const selectedCount = colours.filter((c) => c.selected).length;

  return (
    <div
      role="group"
      aria-labelledby="colour-filter-label"
      className="-mx-2 flex items-center gap-x-0.5 overflow-x-auto px-2 pl-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pl-2.5 [&>*]:flex-none"
    >
      <span
        id="colour-filter-label"
        className="mr-2 inline-flex items-center gap-2 text-sm font-medium text-body"
      >
        Colour
        {selectedCount > 0 && (
          <span className="min-w-5.5 rounded-full bg-accent px-1.75 text-center text-xs leading-5.5 font-semibold text-white tabular-nums">
            <span className="sr-only">selected: </span>
            {selectedCount}
          </span>
        )}
      </span>

      {colours.map((colour) => {
        const hex = colourHex(colour.value);
        const name = `${colour.label}${colour.selected ? ', selected' : ''}`;

        if (!hex) {
          return (
            <Link
              key={colour.value}
              href={colour.href}
              scroll={false}
              aria-label={name}
              className={cn(
                'mx-1 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm',
                colour.selected
                  ? 'border-ink bg-ink text-white'
                  : 'border-divider bg-surface text-ink hover:border-ink',
              )}
            >
              {colour.selected && <CheckIcon width={14} height={14} />}
              {colour.label}
            </Link>
          );
        }

        return (
          <Link
            key={colour.value}
            href={colour.href}
            scroll={false}
            aria-label={name}
            title={colour.label}
            className="group grid size-11 place-items-center rounded-full"
          >
            <span
              className={cn(
                'grid size-7 place-items-center rounded-full bg-(--swatch) transition-shadow',
                colour.selected
                  ? 'shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-ink)]'
                  : 'shadow-[0_0_0_2px_var(--color-surface),0_0_0_3px_var(--color-divider)] group-hover:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-divider)]',
              )}
              style={{ '--swatch': hex } as CSSProperties}
            >
              {colour.selected && (
                <CheckIcon
                  width={14}
                  height={14}
                  strokeWidth={2.6}
                  style={{ color: contrastOn(hex) }}
                />
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
