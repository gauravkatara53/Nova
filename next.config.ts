import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    NEXTAUTH_URL: 'https://nova-puce-rho.vercel.app',
    AUTH_URL: 'https://nova-puce-rho.vercel.app',
    AUTH_TRUST_HOST: 'true',
    AUTH_SECRET: 'nova-super-secret-key-12345-do-not-share-this-key',
  },
};

export default nextConfig;
