import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next's file tracing copies only pg-cloudflare's empty Node stub. Listing it here makes
  // OpenNext copy the whole package, including the "workerd" build that pg needs on Workers.
  serverExternalPackages: ['pg-cloudflare'],
};

export default nextConfig;

import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev());
