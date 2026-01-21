import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remove this block - eslint config is deprecated
  // eslint: {
  //   ignoreDuringBuilds: false,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.atlassian.net',
        pathname: '/secure/useravatar**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
