import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias.sonner = path.join(process.cwd(), "lib/mock-sonner.tsx");
    return config;
  },
};

export default nextConfig;
