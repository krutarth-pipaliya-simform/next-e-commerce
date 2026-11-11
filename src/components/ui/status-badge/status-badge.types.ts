/** Every order, payment, product and store state the badge can show. */
export type Status =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'
  | 'LIVE'
  | 'DRAFT'
  | 'APPROVED'
  | 'AWAITING_APPROVAL'
  | 'SUSPENDED';

export type StatusBadgeProps = {
  /** The state to show; picks the label and tone. */
  status: Status;
  /** Extra classes for the badge. */
  className?: string;
};
