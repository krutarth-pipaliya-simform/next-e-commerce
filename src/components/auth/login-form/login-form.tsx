'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { login, type LoginState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon } from '@/components/ui/icons';
import { InputField } from '@/components/ui/input-field';
import { PasswordField } from '@/components/ui/password-field';

export type LoginFormProps = {
  /** Where to send the user after sign-in. Must already be a safe path. */
  callbackUrl: string;
};

const initialState: LoginState = {};

/** Email and password sign-in, with a form-level error banner. */
export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const wrongCredentials = state.error === 'credentials';

  return (
    <div className="flex flex-col gap-7">
      <div aria-live="assertive" className="empty:hidden">
        {state.error && !pending && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-control border border-sale/20 bg-sale/5 px-4 py-3.5"
          >
            <AlertCircleIcon className="mt-0.5 shrink-0 text-sale" />
            <div className="flex flex-col gap-0.5 text-sm leading-normal">
              {wrongCredentials ? (
                <>
                  <strong className="font-semibold text-sale">
                    Email or password is incorrect
                  </strong>
                  <span className="text-body">
                    Check for typos, or{' '}
                    <Link
                      href="/forgot-password"
                      className="font-medium text-accent hover:underline hover:underline-offset-3"
                    >
                      reset your password
                    </Link>
                    .
                  </span>
                </>
              ) : (
                <strong className="font-semibold text-sale">
                  {state.error}
                </strong>
              )}
            </div>
          </div>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <InputField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={state.email}
          invalid={wrongCredentials}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          required
          invalid={wrongCredentials}
        />

        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="flex min-h-11 items-center text-sm font-medium text-accent hover:underline hover:underline-offset-3"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className="w-full disabled:cursor-progress disabled:bg-ink-hover disabled:opacity-100"
        >
          {pending && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
            />
          )}
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
