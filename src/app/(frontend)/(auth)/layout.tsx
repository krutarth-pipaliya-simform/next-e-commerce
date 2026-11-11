import { AuthShell } from '@/components/layout/auth-shell';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthShell
      aside={
        <figure className="glass-text m-6 max-w-sm rounded-panel p-6">
          <blockquote className="font-display text-[28px] leading-tight tracking-[-0.02em]">
            One bag, <em>many</em> independent stores.
          </blockquote>
          <figcaption className="mt-3 text-sm text-body">
            Each store ships its own part of your order, and you track every
            part from your account.
          </figcaption>
        </figure>
      }
    >
      {children}
    </AuthShell>
  );
}
