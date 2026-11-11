# Next.js E-Commerce Platform

A robust, multi-vendor e-commerce platform built with modern web technologies.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL (via [Prisma Postgres](https://prisma.io/data-platform/postgres))
- **ORM:** [Prisma v7](https://www.prisma.io/)
- **Deployment:** [Prisma Compute](https://prisma.io/data-platform/compute) (Backend/Workers) & Cloudflare
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)

## UI

The storefront follows the "Daylight" design: a light, achromatic interface with liquid-glass controls, so product colours carry the page.

- **Design tokens** (colours, fonts, radii) and the glass utilities (`glass-chrome`, `glass-text`, `glass-adaptive`) live in `@theme` in `src/app/(frontend)/globals.css`.
- **Components** live in `src/components/`, one folder per component with an `index.ts`. Reusable pieces sit in `ui/`, others by feature (`layout/`, `product/`, `home/`). The `create-component` skill in `.claude/skills/` describes the conventions.
- **Routes:** the shop, account, seller and admin pages sit under the `(shop)` route group with a shared header and footer. The home page reads live catalogue data; most other pages are still placeholders.
- **Account menu** (`src/components/layout/account-menu/`): signed out, the header shows a "Sign in" link to the login page, which returns to the current page and links to sign-up. Signed in, it becomes a dropdown with the account pages, the seller or admin area for that role, and Log out.
- **Prices** are shown in Indian rupees (`formatPrice` in `src/lib/utils.ts`).

## Access control

Users have one role: `CUSTOMER`, `SELLER` or `SUPER_ADMIN`. The helpers in `src/lib/authz.ts` enforce it, reading the role from the database on each request because the JWT keeps the role from sign-in.

| Area                                   | Who can open it    | Helper                         |
| -------------------------------------- | ------------------ | ------------------------------ |
| `/admin/*`                             | `SUPER_ADMIN`      | `requireRole(['SUPER_ADMIN'])` |
| `/seller/*`                            | `SELLER`           | `requireRole(['SELLER'])`      |
| `/dashboard/*`, `/checkout/*`, `/cart` | Any signed-in user | `requireUser()`                |
| Server Actions                         | Per action         | `authorizeAction(roles?)`      |

- Signed-out visitors are redirected to `/login?callbackUrl=<page>`. Signed-in users without the role get a 404, so the area's existence isn't revealed.
- The login page (`login` Server Action in `src/actions/auth.ts`) sends users back to `callbackUrl` after sign-in. `safeCallbackUrl` keeps only paths on this site and falls back to `/dashboard`, so sign-in can't redirect to another domain. Signed-in users who open `/login` skip straight to that page.
- Sign-up (`signUp` in `src/actions/auth.ts`) always creates a `CUSTOMER`, then signs the user in. Choosing "I want to sell" only sends them to `/sell` next; it never grants the `SELLER` role. Emails are stored lower-case, and the password rules in `src/lib/password.ts` are checked live in the form and again on the server.
- Every protected page and Server Action runs its own check. A layout check alone doesn't protect child routes.
- `authorizeAction` returns `{ error }` instead of throwing, to match the other Server Actions.

## Documentation

- **Database Schema:** See [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) for a complete breakdown of all data models, fields, and relationships.
- **Architecture & Planning:** See `ecommerce_plan.md` and `development_guide.md`.

## Getting Started

First, ensure you have your `.env` configured with your database string.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
