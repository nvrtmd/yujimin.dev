import path from 'path';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  compiler: {
    reactRemoveProperties:
      process.env.NODE_ENV === 'production'
        ? { properties: ['^data-testid$'] }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
      },
    ],
    unoptimized: true,
  },

  serverExternalPackages: ['better-sqlite3', '@opennextjs/cloudflare'],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/posts': path.resolve('./posts'),
    };
    return config;
  },
};

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
