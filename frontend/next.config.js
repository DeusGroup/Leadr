/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only export static files when explicitly building for production export
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  trailingSlash: process.env.NEXT_OUTPUT === 'export',
  images: {
    unoptimized: process.env.NEXT_OUTPUT === 'export',
  },
  // Remove basePath and assetPrefix for normal development
  basePath: process.env.NEXT_OUTPUT === 'export' ? '/Leadr' : '',
  assetPrefix: process.env.NEXT_OUTPUT === 'export' ? '/Leadr/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // WSL2 stability improvements
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Reduce hot-reload issues
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
