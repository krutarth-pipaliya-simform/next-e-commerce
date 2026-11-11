import type { ReactNode } from 'react';

export type PageHeaderProps = {
  /** Page title, set in the serif display face. */
  title: string;
  /** One line under the title, e.g. "14 orders". */
  description?: string;
  /** Buttons or links aligned to the right of the title. */
  actions?: ReactNode;
};

/** Serif page title for dashboard pages, with subtitle and actions. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[15px] text-body">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
