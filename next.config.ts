import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:title\\.',
        destination: '/api/download/:title',
      },
    ]
  },
};

export default nextConfig;
