import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare", "@neondatabase/serverless"],
};

export default nextConfig;
