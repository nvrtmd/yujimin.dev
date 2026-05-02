import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  reactCompiler: true,
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

  turbopack: {
    resolveAlias: {
      '@/posts': './posts',
    },
  },

  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

export default withNextIntl(nextConfig);
