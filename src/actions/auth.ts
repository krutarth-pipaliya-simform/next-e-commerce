'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';
import { safeCallbackUrl } from '@/lib/authz';
import { db } from '@/lib/db';
import { isPasswordValid } from '@/lib/password';
import bcrypt from 'bcryptjs';

export type LoginState = {
  /** 'credentials' when the email or password is wrong, else a message. */
  error?: 'credentials' | string;
  /** The email that was submitted, to refill the field after an error. */
  email?: string;
};

/**
 * Signs in with email and password, for use with useActionState.
 * On success Auth.js redirects to the form's `callbackUrl` (by throwing a
 * redirect, which must not be caught). On failure it returns `{ error }`.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.', email };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: safeCallbackUrl(formData.get('callbackUrl')),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === 'CredentialsSignin'
            ? 'credentials'
            : 'We couldn’t sign you in. Please try again.',
        email,
      };
    }
    // The success redirect is thrown as an error; let Next handle it.
    throw error;
  }

  return {};
}

type SignUpField = 'name' | 'email' | 'password' | 'confirm' | 'terms';

export type SignUpState = {
  /** A message for the whole form, e.g. when the database is unreachable. */
  error?: string;
  /** Per-field messages. `email: 'in-use'` means the email is taken. */
  fieldErrors?: Partial<Record<SignUpField, string>>;
  /** What was submitted (never the passwords), to refill the form. */
  values?: { name: string; email: string; terms: boolean };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

/**
 * Creates a CUSTOMER account and signs it in, for use with useActionState.
 * The "I want to sell" choice only changes where the user goes next
 * (/sell, to set up a store); it never grants the SELLER role.
 */
export async function signUp(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const terms = formData.get('terms') === 'on';
  const values = { name, email, terms };

  const fieldErrors: SignUpState['fieldErrors'] = {};
  if (!name) fieldErrors.name = 'Enter your name.';
  else if (name.length > 100) fieldErrors.name = 'Use 100 characters or fewer.';
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }
  if (!isPasswordValid(password)) {
    fieldErrors.password = 'Your password needs to meet every rule below.';
  }
  if (confirm !== password) fieldErrors.confirm = 'Passwords don’t match';
  if (!terms) fieldErrors.terms = 'Agree to the terms to continue.';
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) return { fieldErrors: { email: 'in-use' }, values };

    await db.user.create({
      data: {
        name,
        email,
        hashedPassword: await bcrypt.hash(password, 10),
        role: 'CUSTOMER',
      },
    });
  } catch (error) {
    // Two sign-ups with the same email at once: the unique index wins.
    if (isUniqueViolation(error)) {
      return { fieldErrors: { email: 'in-use' }, values };
    }
    console.error('signUp Error:', error);
    return {
      error: 'We couldn’t create your account. Please try again.',
      values,
    };
  }

  const redirectTo =
    formData.get('intent') === 'sell'
      ? '/sell'
      : safeCallbackUrl(formData.get('callbackUrl'));

  try {
    await signIn('credentials', { email, password, redirectTo });
  } catch (error) {
    // The account exists, so let them sign in by hand.
    if (error instanceof AuthError) {
      redirect(`/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
    }
    throw error; // the success redirect
  }

  return {};
}

/** Ends the session and goes to the home page. Use as a form action. */
export async function logout() {
  await signOut({ redirectTo: '/' });
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: 'CUSTOMER',
      },
    });

    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}
