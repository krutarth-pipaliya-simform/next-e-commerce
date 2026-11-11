'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signUp, type SignUpState } from '@/actions/auth';
import { PasswordStrength } from '@/components/auth/password-strength';
import { Button } from '@/components/ui/button';
import {
  AlertCircleIcon,
  BagIcon,
  CheckIcon,
  StoreIcon,
} from '@/components/ui/icons';
import { InputField } from '@/components/ui/input-field';
import { PasswordField } from '@/components/ui/password-field';
import { isPasswordValid } from '@/lib/password';
import { IntentOption } from './intent-option';

export type SignupFormProps = {
  /** Where shoppers go after sign-up. Must already be a safe path. */
  callbackUrl: string;
  /** The sign-in page, keeping `callbackUrl`. Linked when the email is taken. */
  loginHref: string;
};

const initialState: SignUpState = {};
const linkClasses =
  'font-medium text-accent hover:underline hover:underline-offset-3';

/** Account creation: shop/sell choice, details, live password checks. */
export function SignupForm({ callbackUrl, loginHref }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [intent, setIntent] = useState<'shop' | 'sell'>('shop');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const errors = state.fieldErrors ?? {};
  const emailInUse = errors.email === 'in-use';
  const mismatch = confirm.length > 0 && confirm !== password;
  const matches = confirm.length > 0 && confirm === password;
  // A server error goes stale once the password meets every rule.
  const passwordError = isPasswordValid(password) ? undefined : errors.password;
  const confirmError = mismatch
    ? 'Passwords don’t match'
    : matches
      ? undefined
      : errors.confirm;
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-ink">
          How will you use Daylight?
        </legend>
        <div className="grid gap-3">
          <IntentOption
            value="shop"
            title="I want to shop"
            description="Buy from independent stores"
            icon={BagIcon}
            checked={intent === 'shop'}
            onSelect={() => setIntent('shop')}
          />
          <IntentOption
            value="sell"
            title="I want to sell"
            description="Open a store and list your products"
            icon={StoreIcon}
            checked={intent === 'sell'}
            onSelect={() => setIntent('sell')}
          />
        </div>
        <div aria-live="polite">
          {intent === 'sell' && (
            <p className="rounded-control bg-sunken px-4 py-3 text-[13px] leading-normal text-body">
              You’ll set up your store next. A Daylight admin reviews new
              stores, usually within 1–2 days.
            </p>
          )}
        </div>
      </fieldset>

      <div aria-live="assertive" className="empty:hidden">
        {!pending && (hasFieldErrors || state.error) && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-control border border-sale/20 bg-sale/5 px-4 py-3.5 text-sm font-semibold text-sale"
          >
            <AlertCircleIcon className="shrink-0" />
            {state.error ?? 'Fix the highlighted fields to continue'}
          </div>
        )}
      </div>

      <InputField
        id="name"
        label="Full name"
        autoComplete="name"
        placeholder="First and last name"
        required
        maxLength={100}
        defaultValue={state.values?.name}
        error={errors.name}
      />

      <div className="flex flex-col gap-1.5">
        <InputField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={state.values?.email}
          hint="Order updates and receipts go here."
          error={emailInUse ? 'This email is already in use.' : errors.email}
        />
        {emailInUse && (
          <Link href={loginHref} className={`text-[13px] ${linkClasses}`}>
            Sign in instead
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          aria-describedby={[
            passwordError && 'password-error',
            'password-strength',
            'password-rules',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <PasswordStrength id="password" password={password} />
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Type it again"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={confirmError}
        />
        {matches && (
          <p
            aria-live="polite"
            className="flex items-center gap-1.5 text-[13px] text-stock"
          >
            <CheckIcon width={16} height={16} />
            Passwords match
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex min-h-11 items-center gap-3 text-sm leading-normal text-body">
          <input
            type="checkbox"
            name="terms"
            required
            defaultChecked={state.values?.terms}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            className="size-5 shrink-0 accent-ink"
          />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="text-[13px] text-sale">
            {errors.terms}
          </p>
        )}
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
        {pending
          ? 'Creating account…'
          : intent === 'sell'
            ? 'Create account & set up store'
            : 'Create account'}
      </Button>
    </form>
  );
}
