import Link from 'next/link';

export type BreadcrumbsProps = {
  /** The trail, outermost first. The last item is the current page and isn't linked. */
  items: { label: string; href?: string }[];
};

/** A breadcrumb trail separated by slashes. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {last || !item.href ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className="px-1 text-ink"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-1 hover:text-ink"
                >
                  {item.label}
                </Link>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
