import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Updated key per build warning
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'oauth'],

  webpack: (config, { isServer }) => {
    // Only apply to server/edge builds
    if (isServer) {
      // Mark node built-ins as external so webpack ignores them
      // Cloudflare nodejs_compat will (hopefully) provide them
      // Ensure config.externals is an array before pushing
      if (!config.externals) {
        config.externals = [];
      }
      // If it's already an array, push. If it's something else (like an object), this might break, 
      // but typically in Next.js it's adaptable. 
      // Safer approach: use .push if it's an array, or encapsulate in a function? 
      // For simplicity/common Next.js usage, pushing strings usually works.
      if (Array.isArray(config.externals)) {
        config.externals.push('crypto', 'http', 'https', 'url', 'querystring', 'zlib', 'stream');
      } else {
        // If it's not an array, let's wrap it? Or just leave it be and hope for the best?
        // Actually, let's just append our strings to the existing structure if possible.
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          'crypto', 'http', 'https', 'url', 'querystring', 'zlib', 'stream'
        ];
      }
    } else {
      // Fallback for client side (browser)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http: false,
        https: false,
        url: false,
        querystring: false,
        zlib: false,
        stream: false,
      };
    }
    return config;
  },
};

export default nextConfig;
