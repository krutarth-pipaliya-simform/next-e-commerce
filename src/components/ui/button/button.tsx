import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'sm';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-hover',
  secondary: 'bg-surface text-ink border border-divider hover:bg-sunken',
  ghost: 'text-ink hover:bg-sunken',
  destructive: 'bg-surface text-sale border border-sale/20 hover:bg-sale/5',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-5 text-[15px]',
  sm: 'h-11 px-4 text-sm',
};

/**
 * Button classes, so a next/link <Link> can look like a button:
 * <Link className={buttonClasses({ variant: 'secondary' })} />
 */
export type ButtonStyleOptions = {
  /**
   * Visual style.
   * @default 'primary'
   */
  variant?: Variant;
  /**
   * Height and padding: `md` is 48px tall, `sm` is 44px.
   * @default 'md'
   */
  size?: Size;
  /** Extra classes, added last. */
  className?: string;
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

/** Style options plus any native `<button>` attribute. */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<ButtonStyleOptions, 'className'>;

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
