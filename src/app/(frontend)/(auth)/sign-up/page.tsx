import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import {
  DEFAULT_LOGIN_REDIRECT,
  getCurrentUser,
  safeCallbackUrl,
} from '@/lib/authz';

export const metadata: Metadata = {
  title: 'Create account',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const next = safeCallbackUrl(callbackUrl);

  // Already signed in: nothing to create.
  if (await getCurrentUser()) redirect(next);

  const loginHref =
    next === DEFAULT_LOGIN_REDIRECT
      ? '/login'
      : `/login?callbackUrl=${encodeURIComponent(next)}`;

  return (
    <section aria-labelledby="signup-heading" className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <h1
          id="signup-heading"
          className="font-display text-4xl leading-none tracking-[-0.02em] sm:text-5xl"
        >
          Create your account
        </h1>
        <p className="text-[15px] leading-[1.55] text-body">
          One account for shopping and selling. You can open a store later, too.
        </p>
      </div>

      <SignupForm callbackUrl={next} loginHref={loginHref} />

      <p className="border-t border-hairline pt-6 text-sm text-body">
        Already have an account?{' '}
        <Link
          href={loginHref}
          className="font-semibold text-accent hover:underline hover:underline-offset-3"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
