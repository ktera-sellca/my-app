import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  env: {
    CESIUM_BASE_URL: "/cesiumStatic",
  },
};

export default nextConfig;
