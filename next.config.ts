import type { NextConfig } from "next";
// @ts-ignore
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'oauth'],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());
    }
    // For server/edge, we still want to trust nodejs_compat or externalize
    if (isServer) {
      if (!config.externals) config.externals = [];
      if (Array.isArray(config.externals)) {
        config.externals.push('crypto', 'http', 'https', 'url', 'querystring', 'zlib', 'stream');
      }
    }
    return config;
  },
};

export default nextConfig;
