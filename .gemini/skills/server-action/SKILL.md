---
name: server-action
description: >
  Use this skill whenever creating a Next.js Server Action. Triggers: "server action",
  "form submission", "add to cart action", "create order action", "actions/ folder",
  "use server", or any mutation triggered from a form or button without an API route.
---

# Server Action Skill

## When to Use Server Actions vs API Routes

| Use Server Action   | Use API Route          |
| ------------------- | ---------------------- |
| Form submissions    | External API consumers |
| Cart mutations      | Mobile app endpoints   |
| Auth flows          | Webhook receivers      |
| Simple CRUD from UI | Public REST endpoints  |

---

## File Location

```
actions/
  <resource>.ts     ← group by domain
```

Examples:

```
actions/
  cart.ts
  order.ts
  product.ts
  auth.ts
```

---

## Standard Template

```ts
'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOrder(formData: FormData) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // 2. Extract & validate input
  const productId = formData.get('productId') as string;
  const quantity = Number(formData.get('quantity'));

  if (!productId || !quantity) throw new Error('Invalid input');

  // 3. DB operation
  try {
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        total: 0, // calculate before saving
        items: {
          create: [{ productId, quantity, price: 0 }],
        },
      },
    });

    // 4. Revalidate affected paths
    revalidatePath('/orders');

    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: 'Failed to create order' };
  }
}
```

---

## Rules

- Always add `"use server"` at the top of the file
- Always check auth before any mutation
- Always `revalidatePath()` or `revalidateTag()` after mutations
- Return `{ success, data?, error? }` — never throw to the client
- Never return sensitive fields (passwords, tokens)
- Keep actions thin — extract DB logic to `lib/` if reused

---

## Calling from a Component

```tsx
// Server Component with form
import { createOrder } from '@/actions/order';

export default function OrderForm() {
  return (
    <form action={createOrder}>
      <input name="productId" type="hidden" value="123" />
      <input name="quantity" type="number" defaultValue={1} />
      <button type="submit">Place Order</button>
    </form>
  );
}
```

```tsx
// Client Component with button
'use client';
import { createOrder } from '@/actions/order';

export function AddToCartButton({ productId }: { productId: string }) {
  return (
    <button onClick={() => createOrder(new FormData())}>Add to Cart</button>
  );
}
```
