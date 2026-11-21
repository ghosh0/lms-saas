import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LiveKit WebSocket connections in development
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
