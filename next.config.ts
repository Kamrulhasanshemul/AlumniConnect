import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Mark crypto as external so webpack leaves the require() alone for Node.js compat runtime
    // This allows Cloudflare's nodejs_compat to handle it.
    config.externals.push('crypto');
    config.externals.push('bcryptjs');

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  }
};

export default nextConfig;
