import type { ReactNode } from 'react';

type CheckoutSectionProps = {
  /** Anchor the checkout header's step links point at. */
  id: string;
  /** Step number shown in the badge. */
  number: number;
  title: string;
  /** Shown at the right of the heading, e.g. a link or a chip. */
  action?: ReactNode;
  children: ReactNode;
};

/** One numbered step of the checkout form, on a white card. */
export function CheckoutSection({
  id,
  number,
  title,
  action,
  children,
}: CheckoutSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      // Clears the sticky checkout header when a step link jumps here.
      className="flex scroll-mt-36 flex-col gap-6 rounded-panel bg-surface p-5 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-8 md:scroll-mt-28"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id={`${id}-heading`}
          className="flex items-center gap-3.5 font-display text-[32px] leading-none tracking-[-0.02em] sm:text-[40px]"
        >
          <span
            aria-hidden="true"
            className="grid size-8 flex-none place-items-center rounded-full bg-ink font-sans text-sm font-semibold tracking-normal text-white"
          >
            {number}
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
