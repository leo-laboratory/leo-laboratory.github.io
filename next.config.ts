import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      // node: built-ins are only needed at build time; stub them out in the
      // client bundle so webpack doesn't fail on 'node:fs' / 'node:path'.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

export default nextConfig
