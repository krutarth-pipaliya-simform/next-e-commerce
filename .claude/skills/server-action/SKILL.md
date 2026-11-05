---
name: server-action
description: >
  Use this skill whenever creating a Next.js Server Action. Triggers: "server action",
  "form submission", "add to cart action", "create order action", "actions/ folder",
  "use server", or any mutation triggered from a form or button without an API route.
---

# Server Action Skill

## When to Use Server Actions vs API Routes

| Use Server Action   | Use API Route (scaffold-api) |
| ------------------- | ---------------------------- |
| Form submissions    | External API consumers       |
| Cart mutations      | Mobile app endpoints         |
| Auth flows          | Webhook receivers            |
| Simple CRUD from UI | Public REST endpoints        |

---

## File Location

```
src/actions/
  <resource>.ts     ← group by domain
```

Existing: `src/actions/auth.ts`, `src/actions/cart.ts`. `src/actions/cart.ts` is the reference implementation; match its style.

---

## Standard Template

Actions return a result object and **never throw to the client**: `{ success: true, ...data }` on success, `{ error: 'message' }` on failure.

```ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addToWishlist(productId: string) {
  // 1. Auth check
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  // 2. Validate input
  if (!productId) return { error: 'Invalid input' };

  // 3. DB operation
  try {
    const wishlist = await db.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await db.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      update: {},
      create: { wishlistId: wishlist.id, productId },
    });

    // 4. Revalidate affected paths
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('addToWishlist Error:', error);
    return { error: 'Failed to add to wishlist' };
  }
}
```

### Modifying an existing row: check ownership first

Before updating or deleting by id, load the row and confirm it belongs to the session user (see `updateCartItemQuantity` in `src/actions/cart.ts`). Return the same `{ error }` for "not found" and "not yours".

---

## Rules

- `'use server';` at the top of the file.
- Check auth before any mutation; check ownership (or role: `CUSTOMER`, `SELLER`, `SUPER_ADMIN`) before touching an existing row.
- Validate and whitelist inputs. Never spread `FormData`/client objects into Prisma `data`.
- Revalidate after mutations:
  - `revalidatePath('/path')`, or
  - `updateTag(tag)` for cache-tagged data (read-your-own-writes; Server Actions only), or
  - `revalidateTag(tag, 'max')`. The one-argument `revalidateTag(tag)` is deprecated in Next 16.
- Return `{ success, ... }` or `{ error }`; never throw to the client and never return sensitive fields (`hashedPassword`, tokens).
- Keep actions thin; move reused DB logic to `src/lib/`.
- Orders are split per store (`Order` → `StoreOrder` → `OrderItem` with price/name snapshots); see `docs/DATABASE_SCHEMA.md` before writing checkout actions.

---

## Calling from a Component

### Button in a Client Component (action takes plain arguments)

```tsx
'use client';

import { useTransition } from 'react';
import { addToWishlist } from '@/actions/wishlist';

export function WishlistButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await addToWishlist(productId);
          if (result.error) console.error(result.error);
        })
      }
    >
      Save
    </button>
  );
}
```

### Form that shows the result (`useActionState`)

`<form action={...}>` needs an action that returns nothing, so an action that returns `{ error }` must go through `useActionState`. Its signature gains a `prevState` first argument:

```ts
// src/actions/address.ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type AddressState = { success?: boolean; error?: string };

export async function createAddress(
  _prevState: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  const fields = ['street', 'city', 'state', 'zipCode', 'country'] as const;
  const values = Object.fromEntries(
    fields.map((f) => [f, String(formData.get(f) ?? '').trim()]),
  ) as Record<(typeof fields)[number], string>;
  if (fields.some((f) => !values[f]))
    return { error: 'All fields are required' };

  try {
    await db.address.create({ data: { userId, ...values } });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('createAddress Error:', error);
    return { error: 'Failed to save address' };
  }
}
```

```tsx
'use client';

import { useActionState } from 'react';
import { createAddress, type AddressState } from '@/actions/address';

const initialState: AddressState = {};

export function AddressForm() {
  const [state, formAction, pending] = useActionState(
    createAddress,
    initialState,
  );

  return (
    <form action={formAction}>
      <label htmlFor="street">Street</label>
      <input id="street" name="street" required />
      {/* city, state, zipCode, country ... */}
      <p aria-live="polite">{state.error}</p>
      <button type="submit" disabled={pending}>
        Save address
      </button>
    </form>
  );
}
```
