import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production serverless API configuration
  serverExternalPackages: ["@vercel/blob"],
};

export default nextConfig;
