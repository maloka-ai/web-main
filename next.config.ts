import path from 'node:path'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  basePath: '/v0',
  assetPrefix: '/v0',
};

if (process.env.NODE_ENV === 'development') {
  nextConfig.outputFileTracingRoot = path.join(__dirname, '../../')
}

export default nextConfig;
