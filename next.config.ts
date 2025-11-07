import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // ensures the geekageddon folder is used
  },
};

export default nextConfig;
