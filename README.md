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
- **Prices** are shown in Indian rupees (`formatPrice` in `src/lib/utils.ts`).

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
