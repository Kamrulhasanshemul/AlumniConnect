import type { NextConfig } from "next";
// @ts-ignore
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'oauth'],

  webpack: (config, { isServer, nextRuntime }) => {
    // 1. Polyfills for Client and Edge
    // We want polyfills for standard things like path, stream, http, https on Edge too.
    if (!isServer || nextRuntime === 'edge') {
      config.plugins.push(new NodePolyfillPlugin());
    }

    // 2. Server/Edge Specific Handling
    if (isServer) {
      // Edge Runtime specific overrides
      if (nextRuntime === 'edge') {
        // Use Cloudflare's implementations for network stuff (requires nodejs_compat)
        // Externalizing them prevents NodePolyfillPlugin (or webpack) from mocking them with empty objects
        if (!config.externals) config.externals = [];

        // Helper to handle externals array/object variance
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

        addExternals(['net', 'tls', 'dns']);

        // Mock file system access (not supported on Edge)
        // This satisfies 'require("fs")' calls in dependencies like pgpass
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          child_process: false,
          // Ensure we don't accidentally fallback the network stuff we want to externalize
          // (though externals usually take precedence)
        };
      }
    }

    return config;
  },
};

export default nextConfig;
