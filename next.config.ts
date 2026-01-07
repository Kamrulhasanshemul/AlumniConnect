import type { NextConfig } from "next";
// @ts-ignore
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  // Add pg to serverExternalPackages to avoid bundling it if possible, 
  // though adapter-pg usage might still pull it in.
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'oauth', 'pg', 'lightningcss', '@tailwindcss/postcss'],

  webpack: (config, { isServer, nextRuntime }) => {
    // 1. Polyfills for Client and Edge
    if (!isServer || nextRuntime === 'edge') {
      config.plugins.push(new NodePolyfillPlugin());
    }

    // 2. Server/Edge Specific Handling
    if (isServer) {
      if (nextRuntime === 'edge') {
        if (!config.externals) config.externals = [];

        const addExternals = (exts: string[]) => {
          if (Array.isArray(config.externals)) {
            config.externals.push(...exts);
          } else {
            config.externals = [
              ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
              ...exts
            ];
          }
        };

        // Externalize network modules to use Cloudflare nodejs_compat
        // Externalize pg-native so webpack doesn't choke on the require()
        // Externalize crypto just in case node-polyfill-webpack-plugin conflicts with runtime crypto
        addExternals(['net', 'tls', 'dns', 'pg-native']);

        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          child_process: false,
          // Ensure pg-native is not resolved if external doesn't catch it enough
          'pg-native': false,
        };
      }
    }

    return config;
  },
};

export default nextConfig;
