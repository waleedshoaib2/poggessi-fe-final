import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
     remotePatterns: ["localhost", "storage.googleapis.com"].map((elm) => ({ hostname: elm }))
  },
};

export default nextConfig;
