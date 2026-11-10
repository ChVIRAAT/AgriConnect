import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sql.js is bundled (not externalized) so the OpenNext/Workers build does
  // not need to symlink node_modules — it is only ever loaded on Node runs.
  // The workspace contains other lockfiles; pin the app root so Next.js
  // does not infer the wrong workspace root.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
