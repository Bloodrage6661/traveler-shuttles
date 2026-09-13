import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't misdetect it from a parent
  // lockfile (C:\Users\bloodrage\package-lock.json), which broke the RSC manifest.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
