---
name: scaffold-api
description: >
  Use this skill whenever creating or modifying a Next.js App Router API Route Handler.
  Triggers: "create an API route", "add endpoint", "build a route for", "GET/POST/PUT/DELETE route",
  "route handler", or any request to expose data via an API in the e-commerce app.
---

# Scaffold API Route Handler

## File Location

```
app/api/<resource>/route.ts           ← collection (GET all, POST)
app/api/<resource>/[id]/route.ts      ← single item (GET, PUT, DELETE)
```

## Standard Route Template

### Collection route (`route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/<resource>
export async function GET(req: NextRequest) {
  try {
    const items = await db.<model>.findMany()
    return NextResponse.json({ data: items }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST /api/<resource>
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.<model>.create({ data: body })
    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 400 })
  }
}
```

### Single item route (`[id]/route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/<resource>/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await db.<model>.findUnique({ where: { id: params.id } })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ data: item }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// PUT /api/<resource>/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const item = await db.<model>.update({ where: { id: params.id }, data: body })
    return NextResponse.json({ data: item }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 })
  }
}

// DELETE /api/<resource>/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.<model>.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Deleted" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 })
  }
}
```

## Rules

- Always use `NextRequest` / `NextResponse`, not `Request`/`Response` directly
- Always wrap in try/catch
- Never put business logic in route files — extract to `lib/` if complex
- Protect routes that require auth with session check:

```ts
import { auth } from '@/lib/auth';

const session = await auth();
if (!session)
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
