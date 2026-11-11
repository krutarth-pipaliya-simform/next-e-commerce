import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next's file tracing copies only pg-cloudflare's empty Node stub. Listing it here makes
  // OpenNext copy the whole package, including the "workerd" build that pg needs on Workers.
  serverExternalPackages: ['pg-cloudflare'],
  images: {
    // Product photos for the demo catalogue (scripts/seed_demo_products.ts).
    remotePatterns: [new URL('https://cdn.dummyjson.com/product-images/**')],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev());
