import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/mingli",
  images: { unoptimized: true },
};

export default nextConfig;
