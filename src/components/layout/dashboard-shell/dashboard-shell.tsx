import type { ReactNode } from 'react';
import {
  DashboardNav,
  type DashboardNavItem,
} from '@/components/layout/dashboard-nav';
import { Container } from '@/components/ui/container';

export type DashboardShellProps = {
  /** Block at the top of the sidebar: avatar and name, store logo, or "Super admin". */
  context: ReactNode;
  /** Sidebar links, in order. */
  nav: DashboardNavItem[];
  /** The dashboard's overview route, matched exactly when marking the active link. */
  rootHref: string;
  /** Content under the nav, e.g. a sign-out button. */
  footer?: ReactNode;
  /** The page content beside the sidebar. */
  children: ReactNode;
};

/** Sidebar + content layout for the customer, seller and admin dashboards. */
export function DashboardShell({
  context,
  nav,
  rootHref,
  footer,
  children,
}: DashboardShellProps) {
  return (
    <Container className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex flex-col gap-4 rounded-panel border border-hairline bg-surface p-3 lg:w-[260px] lg:shrink-0 lg:p-4">
        <div className="px-1 lg:pb-2">{context}</div>
        <nav aria-label="Dashboard">
          <DashboardNav items={nav} rootHref={rootHref} />
        </nav>
        {footer && (
          <div className="border-t border-hairline pt-3">{footer}</div>
        )}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </Container>
  );
}
