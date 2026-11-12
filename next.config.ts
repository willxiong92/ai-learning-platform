import type { NextConfig } from "next";

// Static export for the GPT Sites deploy: plain HTML files, one directory per route.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
