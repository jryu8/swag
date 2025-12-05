import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!process.env.VERCEL) {  // Only on local dev
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3000/api/:path*",
        },
        {
          source: "/health",
          destination: "http://localhost:3000/health",
        },
      ];
    }
    return []; // On Vercel: use relative /api/
  },
};

export default nextConfig;
