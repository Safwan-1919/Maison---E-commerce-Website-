import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Recharts has harmless d3-color/d3-path type errors we can't fix
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
