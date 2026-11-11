import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { StarIcon } from '@/components/ui/icons';
import { getReviews, getReviewSummary } from '@/lib/catalog';
import { initials } from '@/lib/utils';

export type ProductReviewsProps = {
  /** The product whose reviews to show. */
  productId: string;
};

const reviewDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

/** "Priya Nair" → "Priya N.", so reviews don't show full names. */
function shortName(name: string | null) {
  const [first, ...rest] = (name ?? '').trim().split(/\s+/);
  if (!first) return 'Daylight shopper';
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

function Stars({ value, label }: { value: number; label: string }) {
  const rounded = Math.round(value);
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex gap-0.5 text-ink"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rounded} width={16} height={16} />
      ))}
    </span>
  );
}

/**
 * The reviews section: average rating, how many reviews gave each star
 * rating, and the newest reviews. Reviews are written from an order, so
 * the call to action points at the shopper's orders.
 */
export async function ProductReviews({ productId }: ProductReviewsProps) {
  const [summary, reviews] = await Promise.all([
    getReviewSummary(productId),
    getReviews(productId),
  ]);
  const average = summary.average.toFixed(1);

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="scroll-mt-28"
    >
      <h2
        id="reviews-heading"
        className="font-display text-[clamp(32px,5vw,48px)] leading-[1.05] tracking-[-0.02em]"
      >
        Reviews
      </h2>

      <div className="mt-8 flex flex-wrap items-start gap-6">
        <div className="flex max-w-[400px] flex-[1_1_300px] flex-col gap-5 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-8">
          {summary.count > 0 ? (
            <>
              <div className="flex items-end gap-4">
                <span className="font-display text-[96px] leading-[0.85] tracking-[-0.03em]">
                  {average}
                </span>
                <div className="pb-1.5">
                  <Stars
                    value={summary.average}
                    label={`Rated ${average} out of 5`}
                  />
                  <p className="mt-1 text-sm text-body">
                    Based on {summary.count.toLocaleString('en-IN')}{' '}
                    {summary.count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
              <ul aria-label="Rating breakdown" className="flex flex-col gap-2">
                {summary.breakdown.map((row) => (
                  <li
                    key={row.stars}
                    className="grid grid-cols-[56px_1fr_32px] items-center gap-3 text-sm"
                  >
                    <span className="text-body">
                      {row.stars} {row.stars === 1 ? 'star' : 'stars'}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2 overflow-hidden rounded-full bg-sunken"
                    >
                      <span
                        className="block h-full rounded-full bg-ink"
                        style={{
                          width: `${(row.count / summary.count) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="text-right text-body tabular-nums">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>
              <p className="text-lg font-semibold">No reviews yet</p>
              <p className="mt-1 text-sm leading-normal text-body">
                Bought this? Be the first to say how it went.
              </p>
            </div>
          )}
          <div className="rounded-control bg-sunken p-4 text-[13px] leading-[1.45] text-body">
            Reviews come from shoppers who ordered this product. Write yours
            from the order once it arrives.
          </div>
          <Link
            href="/dashboard/orders"
            className={buttonClasses({ variant: 'secondary' })}
          >
            Review from your orders
          </Link>
        </div>

        {reviews.length > 0 && (
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
            {reviews.map((review) => {
              const name = shortName(review.user.name);
              return (
                <article
                  key={review.id}
                  className="flex flex-col gap-3 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-10 place-items-center rounded-full bg-sunken text-sm font-semibold"
                      >
                        {initials(name) || '?'}
                      </span>
                      <p className="text-[15px] font-medium">{name}</p>
                    </div>
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="text-[13px] text-muted"
                    >
                      {reviewDate.format(review.createdAt)}
                    </time>
                  </div>
                  <Stars
                    value={review.rating}
                    label={`${review.rating} out of 5 stars`}
                  />
                  {review.comment && (
                    <p className="max-w-[68ch] text-[15px] leading-[1.6] whitespace-pre-line text-body">
                      {review.comment}
                    </p>
                  )}
                </article>
              );
            })}
            {summary.count > reviews.length && (
              <p className="text-sm text-muted">
                Showing the {reviews.length} newest of{' '}
                {summary.count.toLocaleString('en-IN')} reviews.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
