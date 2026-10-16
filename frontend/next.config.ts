import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundles a minimal server with only the needed node_modules, used by the Docker image.
  output: "standalone",
};

export default nextConfig;
