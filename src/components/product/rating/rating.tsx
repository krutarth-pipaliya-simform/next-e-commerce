import { StarIcon } from '@/components/ui/icons';

/** Ink stars (achromatic so they don't compete with product colours) plus the count. */
export type RatingProps = {
  /** Average rating from 1 to 5; rounded to whole stars. */
  average: number;
  /** Number of reviews. */
  count: number;
};

export function Rating({ average, count }: RatingProps) {
  const rounded = Math.round(average);
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <span className="flex text-ink" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} filled={n <= rounded} />
        ))}
      </span>
      <span className="sr-only">Rated {average.toFixed(1)} out of 5,</span>
      <span>
        {average.toFixed(1)} ({count}
        <span className="sr-only"> reviews</span>)
      </span>
    </span>
  );
}
