import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

/** Gap above each home section, as in the design (smaller on phones). */
const spacing = {
  /** Below the hero: also clears the glass card hanging off the stage. */
  xl: 'pt-16 sm:pt-[136px]',
  l: 'pt-[72px] sm:pt-[120px]',
  m: 'pt-10 sm:pt-16',
};

export type HomeSectionProps = {
  /** Id of the section's heading, for `aria-labelledby`. */
  id?: string;
  /** Accessible name when the section has no visible heading. */
  label?: string;
  /**
   * Gap above the section.
   * @default 'l'
   */
  space?: keyof typeof spacing;
  /** Extra classes for the `<section>`. */
  className?: string;
  /** Section content, placed inside the page container. */
  children: ReactNode;
};

/** A home page section: the design's top spacing plus the page container. */
export function HomeSection({
  id,
  label,
  space = 'l',
  className,
  children,
}: HomeSectionProps) {
  return (
    <section
      aria-labelledby={id}
      aria-label={label}
      className={cn(spacing[space], className)}
    >
      <Container>{children}</Container>
    </section>
  );
}
