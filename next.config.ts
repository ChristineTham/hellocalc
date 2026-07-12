import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/hellocalc" : "",
  // the dev-only indicator badge sits bottom-left and overlaps the sidebar
  // footer's Settings control; hide it (compile/runtime errors still surface).
  // No effect on the production static export.
  devIndicators: false,
};

export default nextConfig;
