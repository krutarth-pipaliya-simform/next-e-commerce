import type { ReactNode } from 'react';

export type SectionHeadingProps = {
  /** Id for the `<h2>`, so the section can point at it. */
  id: string;
  /** Heading text. */
  title: string;
  /** Link or short note aligned to the right, e.g. "See all stores". */
  aside?: ReactNode;
};

/** Serif section title with an optional link or note on the right. */
export function SectionHeading({ id, title, aside }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <h2
        id={id}
        className="font-display text-[clamp(32px,5vw,48px)] leading-none tracking-[-0.02em]"
      >
        {title}
      </h2>
      {aside}
    </div>
  );
}
