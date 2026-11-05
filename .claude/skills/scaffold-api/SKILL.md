---
name: scaffold-api
description: >
  Scaffold a Next.js App Router Route Handler (HTTP endpoint) for consumers outside this app's UI:
  webhooks, third-party callbacks, mobile/external clients, public REST endpoints. Not for UI
  mutations (use the server-action skill) or for pages (those live in src/app/(frontend)/).
disable-model-invocation: true
---

# Scaffold API Route Handler

## Route Handler or something else?

| Need                                           | Use                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| Form submit / button click in this app's UI    | Server Action in `src/actions/` (server-action skill)            |
| Show data on a page                            | Server Component querying `db` directly in `src/app/(frontend)/` |
| Webhook, third-party callback, external client | Route Handler (this skill)                                       |

The only Route Handler today is Auth.js at `src/app/api/auth/[...nextauth]/route.ts`. Confirm with the user before adding a new one if a Server Action or Server Component would do.

## File location

```
src/app/api/<resource>/route.ts        ← collection (GET list, POST create)
src/app/api/<resource>/[id]/route.ts   ← single item (GET, PATCH, DELETE)
```

## Templates

`params` is a **Promise** in Next 16 and must be awaited. After `next dev`/`next build` has generated types, the global `RouteContext<'/api/<resource>/[id]'>` helper can type the second argument instead (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`).

### Collection route (`src/app/api/products/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/products — public, published products only
export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, slug: true, price: true },
    });
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('GET /api/products Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/products — sellers only, into their own store
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const store = await db.store.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!store || !store.isApproved || store.isSuspended) {
    return NextResponse.json({ error: 'Store not active' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  // Whitelist fields explicitly. Never pass the raw body to Prisma.
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  const description =
    typeof body?.description === 'string' ? body.description : '';
  const categoryId =
    typeof body?.categoryId === 'string' ? body.categoryId : '';
  const price = Number(body?.price);
  if (!name || !slug || !categoryId || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const product = await db.product.create({
      data: { storeId: store.id, categoryId, name, slug, description, price },
    });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
```

### Single item route (`src/app/api/products/[id]/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/products/[id] — only the owning seller
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { store: { select: { ownerId: true } } },
    });
    // Same response for "missing" and "not yours", so ids can't be probed.
    if (!product || product.store.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/products/[id] Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
```

## Rules

- Use `NextRequest` / `NextResponse`; respond with `{ data }` or `{ error }` and a matching status code.
- Authenticate by default (`await auth()`); leave an endpoint public only on purpose. Check the role (`CUSTOMER`, `SELLER`, `SUPER_ADMIN`) and **ownership** before any write.
- Whitelist and validate input fields. Never pass `req.json()` straight into `data:`, which would let callers set `role`, `isApproved`, `storeId` and similar fields.
- `select` only the fields the caller needs. Never return `hashedPassword` or tokens.
- Wrap DB work in try/catch and log with `console.error`; don't leak error details to the client.
- Keep business logic out of route files; move reusable logic to `src/lib/`.
- To invalidate cached data from a Route Handler use `revalidateTag(tag, 'max')` (the one-argument form is deprecated in Next 16); `updateTag` only works in Server Actions.
