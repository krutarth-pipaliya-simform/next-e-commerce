import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import type { Role } from '@/generated/prisma/enums';

// The role on the session is the one from sign-in and can be stale.
// Authorize with the helpers in src/lib/authz.ts, which read it from the db.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: Role;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: Role;
  }
}
