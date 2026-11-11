import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import {
  DEFAULT_LOGIN_REDIRECT,
  getCurrentUser,
  safeCallbackUrl,
} from '@/lib/authz';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const next = safeCallbackUrl(callbackUrl);

  // Already signed in: skip the form.
  if (await getCurrentUser()) redirect(next);

  const signUpHref =
    next === DEFAULT_LOGIN_REDIRECT
      ? '/sign-up'
      : `/sign-up?callbackUrl=${encodeURIComponent(next)}`;

  return (
    <section aria-labelledby="login-heading" className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <h1
          id="login-heading"
          className="font-display text-4xl leading-none tracking-[-0.02em] sm:text-5xl"
        >
          Welcome back
        </h1>
        <p className="text-[15px] leading-[1.55] text-body">
          Sign in to see your bag, track orders and check out faster.
        </p>
      </div>

      <LoginForm callbackUrl={next} />

      <div className="flex flex-col gap-3 border-t border-hairline pt-6 text-sm leading-normal text-body">
        <p>
          New to Daylight?{' '}
          <Link
            href={signUpHref}
            className="font-semibold text-accent hover:underline hover:underline-offset-3"
          >
            Create account
          </Link>
        </p>
        <p className="text-[13px] text-muted">
          Selling on Daylight? Use this same sign-in. Your store dashboard opens
          from your account menu.
        </p>
      </div>
    </section>
  );
}
