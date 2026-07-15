import type { NextConfig } from 'next'

const nextConfig = {
  cacheComponents: true,
  cacheLife: {
    catalog: {
      stale: 60,
      revalidate: 60,
      expire: 3600,
    },
  },
} satisfies NextConfig

export default nextConfig
