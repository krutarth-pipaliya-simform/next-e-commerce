import { DashboardShell } from '@/components/layout/dashboard-shell';

const nav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/stores', label: 'Store approvals' },
  { href: '/admin/categories', label: 'Categories' },
];

// Display only. Each admin page and Server Action must check for the
// SUPER_ADMIN role itself; a layout check doesn't protect child routes.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      rootHref="/admin"
      nav={nav}
      context={
        <div>
          <p className="text-[13px] text-muted">Super admin</p>
          <p className="font-display text-2xl tracking-[-0.02em]">
            Daylight HQ
          </p>
        </div>
      }
    >
      {children}
    </DashboardShell>
  );
}
