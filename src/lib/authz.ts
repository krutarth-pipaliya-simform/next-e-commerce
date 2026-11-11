import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Role } from '@/generated/prisma/enums';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
};

/**
 * The signed-in user, or null.
 *
 * The role comes from the database, not the JWT: the token keeps the role
 * from sign-in, so a customer who becomes a SELLER (or a demoted or deleted
 * account) would otherwise keep their old access until they sign in again.
 * Memoised per request, so pages and layouts can call it freely.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
});

export function hasRole(
  user: CurrentUser | null,
  roles: readonly Role[],
): user is CurrentUser {
  return user !== null && roles.includes(user.role);
}

/** Where to go after sign-in when no safe `callbackUrl` is given. */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

/**
 * A `callbackUrl` from the query string or a form, kept only when it is a
 * path on this site. Anything else (`https://evil.test`, `//evil.test`,
 * `/\evil.test`) falls back to DEFAULT_LOGIN_REDIRECT, so sign-in can't be
 * used to bounce people to another site.
 */
export function safeCallbackUrl(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_LOGIN_REDIRECT;
  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_LOGIN_REDIRECT;
  }
  if (value.includes('\\')) return DEFAULT_LOGIN_REDIRECT;
  return value;
}

function loginUrl(callbackUrl?: string) {
  return callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login';
}

/**
 * For pages and layouts. Redirects to /login when signed out.
 * Pass the page's own path as `callbackUrl` to come back after sign-in.
 */
export async function requireUser(callbackUrl?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(callbackUrl));
  return user;
}

/**
 * For pages and layouts. Redirects to /login when signed out and renders
 * a 404 when the user lacks every role in `roles`, so the area's existence
 * isn't revealed.
 *
 * Check in every page, not only the layout: layouts don't re-run on client
 * navigation and don't stop their child segments from rendering.
 */
export async function requireRole(
  roles: readonly Role[],
  callbackUrl?: string,
): Promise<CurrentUser> {
  const user = await requireUser(callbackUrl);
  if (!roles.includes(user.role)) notFound();
  return user;
}

type ActionAuth =
  { user: CurrentUser; error?: never } | { user?: never; error: string };

/**
 * For Server Actions, which return `{ error }` instead of throwing.
 * Omit `roles` to allow any signed-in user.
 *
 * @example
 * const { user, error } = await authorizeAction(['SUPER_ADMIN']);
 * if (error) return { error };
 */
export async function authorizeAction(
  roles?: readonly Role[],
): Promise<ActionAuth> {
  let user: CurrentUser | null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('authorizeAction Error:', error);
    return { error: 'Could not verify your session' };
  }

  if (!user) return { error: 'Unauthorized' };
  if (roles && !roles.includes(user.role)) return { error: 'Forbidden' };
  return { user };
}
