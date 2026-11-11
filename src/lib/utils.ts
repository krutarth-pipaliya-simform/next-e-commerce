/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// Indian rupees with Indian digit grouping, e.g. ₹1,24,999.00.
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

/** Formats a price. Accepts Prisma Decimal values through their toString(). */
export function formatPrice(value: number | string | { toString(): string }) {
  return currency.format(Number(value.toString()));
}
