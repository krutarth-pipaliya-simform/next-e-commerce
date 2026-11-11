import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The page container: 1320px max, 32px gutters (16px on phones). */
export type ContainerProps = {
  /** Page content. */
  children: ReactNode;
  /** Extra classes, e.g. vertical padding. */
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1320px] px-4 sm:px-8', className)}
    >
      {children}
    </div>
  );
}
