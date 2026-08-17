# E-Commerce Development Guide & Roadmap

This document outlines the core features to build, the skills you will practice, and the conventions to follow when manually building the Next.js e-commerce application.

## 📱 Core Features to Build

### 1. Product Catalog & Discovery
- **Home Page:** Hero section and featured categories/products.
- **Product Listing Page (PLP):** Grid layout of products.
- **Search & Filtering:** Search functionality and filtering (by price, category).

### 2. Product Details Page (PDP)
- **Product Information:** Image gallery, product description, and pricing.
- **Variations:** Handling variations (like selecting different sizes or colors).

### 3. Shopping Cart
- **Cart Management:** Adding/removing items and updating quantities.
- **Persistence:** Persisting cart state so it doesn't empty when the page refreshes (using local storage or database).

### 4. Checkout Simulation
- **Checkout Flow:** A multi-step form for shipping details.
- **Order Confirmation:** Order summary and a simulated "Confirm Payment" action.

### 5. User Accounts (Authentication)
- **Auth Flow:** Sign up / Log in (using NextAuth.js).
- **User Dashboard:** User profile page to view past orders and saved details.

### 6. Admin Dashboard (Optional / Bonus)
- **Product Management:** A secure area to create, update, or delete products in the database.

---

## 🧠 Skills You Will Learn & Practice

### 1. Next.js App Router Mechanics
- Mastering the mental model of **Server Components** vs. **Client Components**.
- Using special files like `layout.tsx`, `page.tsx`, `loading.tsx`, and `error.tsx`.
- Creating API endpoints (Route Handlers) and Server Actions for form submissions.

### 2. React Fundamentals
- Advanced use of hooks (`useState`, `useEffect`, `useContext`, `useFormStatus`).
- Managing complex global state (like the shopping cart) across the application.

### 3. Database & ORM
- Designing a relational database schema (Users ↔ Orders ↔ Products).
- Using **Prisma ORM** to query the PostgreSQL database safely and efficiently.

### 4. Styling & UI
- Building responsive layouts and establishing a design system using **Tailwind CSS**.

### 5. Authentication
- Understanding how secure sessions, cookies, and OAuth (via NextAuth) work under the hood.

---

## 📏 Conventions & Best Practices to Follow

### 1. Default to Server Components
Always build components as Server Components by default to keep bundle sizes small and secure. Only add `"use client"` at the top of the file when you need browser interactivity (like `onClick` events) or React lifecycle hooks (like `useState`).

### 2. Folder Structure
Keep the `app/` folder strictly for routing. Structure your project cleanly by putting reusable UI pieces in a separate `components/` folder, database/utility logic in a `lib/` folder, and server actions in an `actions/` folder.

### 3. Data Fetching
Fetch data as close to where it's used as possible. The Next.js App Router automatically deduplicates requests, so you don't need to fetch at the top level and pass props all the way down the component tree.

### 4. Environment Variables
Keep secrets (like database URLs and Auth secrets) in a `.env.local` file. **Never** prefix them with `NEXT_PUBLIC_` unless they are explicitly meant to be exposed to the browser.

### 5. Image Optimization
Always use the `<Image />` component from `next/image` instead of the standard `<img>` tag to ensure images are automatically optimized, resized, and served in modern formats (like WebP) for better performance.
