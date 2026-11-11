# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

These apply to every agent working in this repo (Claude Code, Cursor, Antigravity, Copilot):

1. **Git workflow:** follow `.claude/skills/git-workflow/SKILL.md` before making any commit, branch or PR. Use conventional commits and the branching strategy described there.
2. **Project plan:** read `docs/ecommerce_plan.md` and `docs/development_guide.md` to understand the architecture, the design choices and the features being built.
3. **Database schema:** `docs/DATABASE_SCHEMA.md` documents the data models. Whenever you modify `prisma/schema.prisma`, you MUST update `docs/DATABASE_SCHEMA.md` in the same change.
4. **Documentation:** after changing a major feature, you MUST update `README.md` before committing.

## Skill precedence

Skills in `.claude/skills/` are mostly third-party (see `.claude/THIRD-PARTY-SKILLS.md`) and written for other stacks. When a skill disagrees with this file, this file wins:

- **Code conventions:** the conventions in this file and `src/` override code samples in any skill:
  - paths under `src/`
  - one Prisma client, `db` from `@/lib/db`
  - Server Actions return `{ error }` instead of throwing
  - async `params`
  - single quotes
- **Git:** no skill commits, creates branches, pushes, or comments on GitHub issues/PRs unless the user asks for that in the current turn. Stage named files only.
- **Tests:** there is no test framework. Ask before installing one, and never run `scripts/` (they write to the real `DATABASE_URL`) without asking.
- **Docs and notes:**
  - Glossaries, ADRs and research notes are created only when the user asks, under `docs/`.
  - The data model's source of truth is `docs/DATABASE_SCHEMA.md`.
- **Code-review standards:** use this file, `docs/development_guide.md`, `.prettierrc` and `.lintstagedrc`. Files in `.claude/skills/` are agent instructions, not repo standards.
- **Route protection:** Next 16 renamed `middleware.ts` to `proxy.ts`. Proxy runs on Node.js, which OpenNext Cloudflare rejects at build time. Protect routes with `auth()` checks in layouts, pages and Server Actions instead.

## Commands

| Task                                                                                                                                               | Command                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Dev server (also starts the Cloudflare dev bindings through `initOpenNextCloudflareForDev` in `next.config.ts`)                                    | `npm run dev`                              |
| Type check (the husky pre-commit runs this after `lint-staged`)                                                                                    | `npm run type-check`                       |
| Lint                                                                                                                                               | `npm run lint`                             |
| Format and lint the staged files                                                                                                                   | `npx lint-staged`                          |
| Format all source files                                                                                                                            | `npx prettier --write "src/**/*.{ts,tsx}"` |
| Preview the Workers build locally                                                                                                                  | `npm run preview`                          |
| Deploy to Cloudflare Workers through OpenNext (CI also does this on every push to `main`, in `.github/workflows/deploy.yml`)                       | `npm run deploy`                           |
| Regenerate the Cloudflare env types                                                                                                                | `npm run cf-typegen`                       |
| Regenerate the Prisma client (output goes to `src/generated/prisma`, which is gitignored, so run this after cloning and after every schema change) | `npx prisma generate`                      |
| Create and apply a migration (config is in `prisma.config.ts`, which reads `DATABASE_URL` from `.env`)                                             | `npx prisma migrate dev --name <name>`     |

There is no test framework. The files in `scripts/` (`test_auth.ts`, `test_auth_handlers.ts`, `test_cart_db.ts`) are ad-hoc smoke scripts. They run against the real `DATABASE_URL` and write to it. Run one with `npx tsx scripts/<file>.ts`. `tsx` is not a dependency, and it is needed because the code under `src/` uses `@/` path aliases.

## Architecture

The project is a multi-vendor marketplace on the Next.js App Router, deployed to Cloudflare Workers with `@opennextjs/cloudflare`. It uses PostgreSQL through Prisma 7 and Auth.js (NextAuth v5 beta).

- **Routing:** all UI routes sit under the `src/app/(frontend)/` route group, which holds the root `layout.tsx` and `globals.css`. Auth pages go under `(frontend)/(auth)/`. The only API route is the Auth.js handler at `src/app/api/auth/[...nextauth]/route.ts`. Most page files are still placeholders.
- **Layering** (from `docs/development_guide.md`):
  - `app/` is for routing only.
  - Mutations are Server Actions in `src/actions/*.ts`, marked `'use server'`. They return `{ success, ... }` or `{ error }` objects instead of throwing.
  - Shared server logic goes in `src/lib/`.
  - Reusable UI goes in `src/components/`, which doesn't exist yet.
  - Use Server Components by default, and add `"use client"` only when a component needs interactivity.
- **Database client (`src/lib/db.ts`):**
  - Import `PrismaClient` from `../generated/prisma/client`, not from `@prisma/client`.
  - The client uses the `@prisma/adapter-pg` driver adapter on top of a `pg` Pool, and it is cached on `globalThis` outside production.
  - Always import `db` from `@/lib/db`.
- **Auth (`src/lib/auth.ts`):**
  - Credentials provider with bcrypt, a Prisma adapter and **JWT sessions**.
  - The `jwt`/`session` callbacks copy `user.role` into the token and then onto `session.user.role`. `session.user.id` comes from `token.sub`.
  - The type augmentation is in `src/types/next-auth.d.ts`.
  - Server actions get the current user with `await auth()`.
- **Data model** (full reference in `docs/DATABASE_SCHEMA.md`):
  - `User.role` is one of `CUSTOMER | SELLER | SUPER_ADMIN`.
  - Each SELLER owns one `Store`. A Super Admin must approve a store (`isApproved`) and can suspend it (`isSuspended`).
  - Checkout creates one parent `Order` (what the customer pays, with a shipping-address snapshot). It splits into one `StoreOrder` per store, and each seller fulfils their own `StoreOrder`.
  - `OrderItem` keeps snapshots of the name, price and variant fields, so order history survives product deletion.
  - Each user has one `Cart`. `CartItem` is unique on `(cartId, productId, productVariantId)`, but `productVariantId` is nullable and Postgres treats NULLs as distinct. That's why `src/actions/cart.ts` checks for an existing row with `findFirst` instead of an upsert on that unique key.
  - Cart actions that modify an item check that it belongs to the session user before writing.

## Conventions

- Prettier and ESLint run on staged files through `lint-staged` (`.lintstagedrc`). Code uses single quotes and trailing commas.
- Use `next/image` instead of `<img>`.
- Everything clickable shows a pointer cursor. A global rule at the end of `@layer base` in `src/app/(frontend)/globals.css` gives it to enabled native controls: `<button>`, `role='button'`, `<summary>`, `<select>`, checkbox, radio, button/submit/file inputs, and a `<label>` that wraps a checkbox or radio (a label tied with `htmlFor` isn't covered). Build clickable things from those elements so the rule applies, and add `cursor-pointer` only to a custom element it can't see. Disabled and pending states use `disabled:cursor-not-allowed` or `cursor-progress`.
- Never prefix secrets with `NEXT_PUBLIC_`. Local secrets are in `.env` (`DATABASE_URL`, `AUTH_SECRET`) and `.dev.vars` (for Wrangler).
- Use conventional commits, for example `feat(cart): ...` or `docs(db): ...`.
