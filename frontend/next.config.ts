
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amazon-berkeley-objects.s3.amazonaws.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
