import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // Allow LAN devices (phones, tablets) to receive HMR updates in dev.
  // Next.js 15+ blocks cross-origin dev resources by default.
  // Update this list if your machine's LAN IP changes.
  allowedDevOrigins: ["192.168.1.100"],

  // Proxy all /api/* requests to the backend server.
  // This means the frontend can use a relative /api base URL and works from
  // any device on the same network — the Next.js process (running on this machine)
  // forwards the request to localhost:5000 transparently.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);