import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    forceSwcTransforms: false,
  },
} as NextConfig;
export default nextConfig;
