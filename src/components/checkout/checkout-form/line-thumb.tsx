import Image from 'next/image';
import type { BagLine } from '@/lib/cart';
import { cn, formatPrice } from '@/lib/utils';

type LineThumbProps = {
  line: BagLine;
  /** `md` in the delivery step, `sm` in the summary. */
  size: 'sm' | 'md';
};

const sizes = {
  sm: { box: 'h-15 w-13', px: '52px' },
  md: { box: 'h-18 w-16', px: '64px' },
};

/** A bag line as a row: photo, name, options with quantity, and line total. */
export function LineThumb({ line, size }: LineThumbProps) {
  const details = [line.options, `Qty ${line.quantity}`]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className={cn(
          'stage relative flex-none overflow-hidden rounded-stage shadow-[inset_0_0_0_1px_var(--color-hairline)]',
          sizes[size].box,
        )}
      >
        {line.image && (
          <Image
            src={line.image.url}
            alt=""
            fill
            sizes={sizes[size].px}
            className="object-contain p-1.5"
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] leading-snug font-medium">
          {line.name}
        </span>
        <span className="text-[13px] text-muted">{details}</span>
      </div>
      <span className="text-[15px] font-semibold tabular-nums">
        {formatPrice(line.lineTotal)}
      </span>
    </div>
  );
}
