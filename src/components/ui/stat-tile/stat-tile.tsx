import { cn } from '@/lib/utils';

export type StatTileProps = {
  /** What the number measures, e.g. "Revenue this week". */
  label: string;
  /** The number, already formatted. */
  value: string;
  /** Change since the last period. Shown with an arrow, not colour alone. */
  delta?: { value: string; direction: 'up' | 'down' };
};

/** A single dashboard metric: label, big number and an optional change. */
export function StatTile({ label, value, delta }: StatTileProps) {
  return (
    <div className="rounded-card border border-hairline bg-surface p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 font-display text-[40px] leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            'mt-2 text-[13px] font-medium',
            delta.direction === 'up' ? 'text-stock' : 'text-sale',
          )}
        >
          <span aria-hidden="true">{delta.direction === 'up' ? '↑' : '↓'}</span>{' '}
          {delta.value}
        </p>
      )}
    </div>
  );
}
