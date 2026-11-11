import { Suspense } from 'react';
import { LogOutIcon, UserIcon } from '@/components/ui/icons';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { auth, signOut } from '@/lib/auth';

const nav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/wishlist', label: 'Wishlist' },
  { href: '/dashboard/settings', label: 'Profile & addresses' },
  { href: '/sell', label: 'Sell on Daylight' },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

// Display only. Each page still has to check the session itself: a layout
// doesn't re-run on client navigation and doesn't stop its pages rendering.
async function AccountContext() {
  const session = await auth();
  const name = session?.user?.name;
  const email = session?.user?.email;

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken text-sm font-semibold"
      >
        {name ? initials(name) : <UserIcon />}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">{name ?? 'Your account'}</p>
        {email && <p className="truncate text-[13px] text-muted">{email}</p>}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      rootHref="/dashboard"
      nav={nav}
      context={
        <Suspense fallback={<div className="h-11" />}>
          <AccountContext />
        </Suspense>
      }
      footer={
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="flex h-11 w-full items-center gap-3 rounded-control px-3 text-[15px] font-medium text-body hover:bg-sunken hover:text-ink"
          >
            <LogOutIcon />
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </DashboardShell>
  );
}
