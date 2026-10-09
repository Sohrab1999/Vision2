import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* type errors fail the build again (Phase-0 safety: no silently-shipped bugs) */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
