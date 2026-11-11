import { DashboardShell } from '@/components/layout/dashboard-shell';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasRole } from '@/lib/authz';

const nav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/stores', label: 'Store approvals' },
  { href: '/admin/categories', label: 'Categories' },
];

// This check only keeps the admin shell from rendering for other roles.
// It doesn't protect child routes: each admin page calls requireRole and
// each admin Server Action calls authorizeAction itself. Signed-out
// visitors fall through so the page redirects with its own callbackUrl.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user && !hasRole(user, ['SUPER_ADMIN'])) notFound();

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
