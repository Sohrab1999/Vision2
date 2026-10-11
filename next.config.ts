import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* type errors fail the build again (Phase-0 safety: no silently-shipped bugs) */
  typescript: {
    ignoreBuildErrors: false,
  },
  /* audit 2026-10-12 (A-11): strict mode back on — it double-mounts effects in
     dev so missing-cleanup bugs (like the duel countdown leak) surface instead
     of hiding. All known effect leaks were fixed in the same pass. */
  reactStrictMode: true,
};

export default nextConfig;
