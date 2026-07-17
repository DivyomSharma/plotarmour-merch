import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bulkplaintshirt.com",
      },
    ],
  },
};

export default nextConfig;
