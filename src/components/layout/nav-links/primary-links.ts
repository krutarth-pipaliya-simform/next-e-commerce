// Kept outside nav-links.tsx: a Server Component importing a value from a
// 'use client' module gets a client reference, not the array.
export const primaryLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/stores', label: 'Stores' },
] as const;
