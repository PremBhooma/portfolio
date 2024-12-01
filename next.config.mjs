/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true,
  skipWaiting: true,
};

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(pwaConfig)(nextConfig);
