import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
     remotePatterns: ["localhost", "storage.googleapis.com"].map((elm) => ({ hostname: elm }))
  },
};

export default nextConfig;
