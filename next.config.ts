import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the application root explicit in the parent workspace.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
