# Next.js E-Commerce Platform

A robust, multi-vendor e-commerce platform built with modern web technologies.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL (via [Prisma Postgres](https://prisma.io/data-platform/postgres))
- **ORM:** [Prisma v7](https://www.prisma.io/)
- **Deployment:** [Prisma Compute](https://prisma.io/data-platform/compute) (Backend/Workers) & Cloudflare

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
