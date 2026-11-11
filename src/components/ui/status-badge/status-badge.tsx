import { cn } from '@/lib/utils';
import type { Status, StatusBadgeProps } from './status-badge.types';

const styles: Record<Status, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-sunken text-body' },
  PROCESSING: { label: 'Processing', className: 'bg-sunken text-body' },
  PAID: { label: 'Paid', className: 'bg-stock/10 text-stock' },
  SHIPPED: { label: 'Shipped', className: 'bg-accent/10 text-accent' },
  DELIVERED: { label: 'Delivered', className: 'bg-stock/10 text-stock' },
  FAILED: { label: 'Failed', className: 'bg-sale/8 text-sale' },
  CANCELLED: { label: 'Cancelled', className: 'bg-sale/8 text-sale' },
  LIVE: { label: 'Live', className: 'bg-stock/10 text-stock' },
  DRAFT: {
    label: 'Draft',
    className: 'bg-surface text-body border border-dashed border-divider',
  },
  APPROVED: { label: 'Approved', className: 'bg-stock/10 text-stock' },
  AWAITING_APPROVAL: {
    label: 'Awaiting approval',
    className: 'bg-pending-bg text-pending',
  },
  SUSPENDED: { label: 'Suspended', className: 'bg-sale/8 text-sale' },
};

/** Order, payment, product and store states. The text label always shows, not just the colour. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: tone } = styles[status];
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center gap-1.5 rounded-chip px-2.5 text-xs font-semibold whitespace-nowrap',
        tone,
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
