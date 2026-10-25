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
  /* Task 105 «پلِ سوکتِ محلیِ توسعه» — the duel UI dials the judge with
     io("/?XTransformPort=3003") same-origin: production rides the gateway's
     XTransformPort route, but a bare dev sandbox has no gateway, so the setup
     panel stuck at «در حال اتصال…» forever and no browser-level duel QA was
     possible (documented in task 104-b). In dev we bridge /socket.io straight
     to the loopback judge. socket.io starts on long-polling (plain HTTP, fully
     supported by dev rewrites) and only upgrades to ws when the proxy allows
     it — polling-only fallback is fine for QA. Production (standalone,
     NODE_ENV=production) returns [] → byte-identical routing to before. */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/socket.io/:path*",
        destination: "http://127.0.0.1:3003/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
