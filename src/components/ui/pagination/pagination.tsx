import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type PaginationProps = {
  /** The current page, from 1. */
  page: number;
  /** How many pages there are. Nothing renders when there's only one. */
  pageCount: number;
  /** Total items across all pages, for the "Showing 1–24 of 248" line. */
  total: number;
  /** Items per page. */
  pageSize: number;
  /** The URL of a page. */
  hrefFor: (page: number) => string;
};

/** First, last, and the pages around the current one, with gaps between. */
function pageWindow(page: number, pageCount: number) {
  const pages = new Set([1, page - 1, page, page + 1, pageCount]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push('gap');
    items.push(p);
  });
  return items;
}

const stepClasses =
  'inline-flex h-11 w-11 items-center justify-center gap-1.5 rounded-control text-sm font-medium sm:w-auto';

/** Numbered page links with Previous and Next, plus the range shown. */
export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  hrefFor,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6"
    >
      <p className="text-sm text-body">
        Showing{' '}
        <strong className="font-semibold text-ink tabular-nums">
          {from}–{to}
        </strong>{' '}
        of {total.toLocaleString('en-IN')}
      </p>
      <ul className="flex flex-wrap items-center gap-1 tabular-nums">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              className={cn(
                stepClasses,
                'text-ink hover:bg-ink/6 sm:pr-4 sm:pl-2.5',
              )}
            >
              <ChevronLeftIcon width={16} height={16} />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(stepClasses, 'text-muted sm:pr-4 sm:pl-2.5')}
            >
              <ChevronLeftIcon width={16} height={16} />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </span>
          )}
        </li>
        {pageWindow(page, pageCount).map((item, i) =>
          item === 'gap' ? (
            <li
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1.5 text-muted"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'grid size-11 place-items-center rounded-full text-sm',
                  item === page
                    ? 'bg-ink font-semibold text-white'
                    : 'font-medium text-ink hover:bg-ink/6',
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link
              href={hrefFor(page + 1)}
              className={cn(
                stepClasses,
                'border border-hairline bg-surface text-ink hover:bg-ground sm:pr-2.5 sm:pl-4',
              )}
            >
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRightIcon width={16} height={16} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(stepClasses, 'text-muted sm:pr-2.5 sm:pl-4')}
            >
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRightIcon width={16} height={16} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
