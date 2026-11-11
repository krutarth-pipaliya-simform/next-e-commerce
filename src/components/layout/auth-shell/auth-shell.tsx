import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

/**
 * Sign-in / sign-up / reset layout: wordmark-only header, the form on an
 * opaque panel, and a white studio stage beside it (on top on phones).
 * `aside` fills the stage, e.g. a product image collage.
 */
export type AuthShellProps = {
  /** The form, shown on the opaque panel. */
  children: ReactNode;
  /** Fills the studio stage beside the form, e.g. a product collage. */
  aside?: ReactNode;
};

export function AuthShell({ children, aside }: AuthShellProps) {
  return (
    <div className="min-h-dvh">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-display text-[28px] leading-none tracking-[-0.02em]"
        >
          Daylight
        </Link>
        <Link
          href="/products"
          className="flex h-11 items-center text-[15px] font-medium text-body hover:text-ink"
        >
          Back to shop
        </Link>
      </Container>
      <Container className="flex flex-col-reverse gap-6 pb-16 lg:flex-row lg:items-stretch">
        <main className="w-full rounded-panel border border-hairline bg-surface p-6 sm:p-10 lg:max-w-[440px]">
          {children}
        </main>
        <div className="stage relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded-panel border border-hairline lg:min-h-[640px]">
          {aside}
        </div>
      </Container>
    </div>
  );
}
