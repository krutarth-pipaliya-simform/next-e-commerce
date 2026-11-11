import { cn } from '@/lib/utils';

export type SkeletonProps = {
  /** Size and shape, e.g. `h-64 rounded-panel`. */
  className?: string;
};

/** A pulsing placeholder block for content that is still loading. Hidden from screen readers. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-card bg-surface/70 motion-reduce:animate-none',
        className,
      )}
    />
  );
}
