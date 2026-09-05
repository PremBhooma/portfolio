/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true,
  skipWaiting: true,
};

// next/image refuses any host not listed below, so the deployed API host has to
// be derived from the same variable the client fetches from — otherwise every
// project image 400s in production while working against a local backend.
const apiImagePatterns = (() => {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const { protocol, hostname, port } = new URL(process.env.NEXT_PUBLIC_API_URL);
    return [
      {
        protocol: protocol.replace(":", ""),
        hostname,
        ...(port ? { port } : {}),
        pathname: "/uploads/**",
      },
    ];
  } catch {
    console.warn(`Ignoring unparseable NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    return [];
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      ...apiImagePatterns,
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5005",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(pwaConfig)(nextConfig);
