import createMDX from '@next/mdx';
import path from 'path';
// 👇 [수정] 올바른 함수를 올바른 경로에서 임포트합니다.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // 프로덕션 빌드에서 data-testid 자동 제거
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
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/posts': path.resolve('./posts'),
    };
    return config;
  },
};

// 👇 [수정] 개발 환경일 때 올바른 함수를 호출합니다.
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

const withMDX = createMDX({});

export default withMDX(nextConfig);
