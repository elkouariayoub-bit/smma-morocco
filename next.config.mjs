import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function aliasWhenMissing(config, moduleName, stubPath, aliasKey = moduleName) {
  try {
    require.resolve(moduleName);
  } catch {
    config.resolve.alias[aliasKey] = path.resolve(process.cwd(), stubPath);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // allow these server-only packages to be bundled for Node functions
  serverExternalPackages: ['exceljs', 'pdf-lib'],
  experimental: {
    serverComponentsExternalPackages: ['exceljs', 'pdf-lib'],
  },
  // helpful during migration; keep typecheck but loosen lib checks
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.resolve.alias['@daveyplate/better-auth-ui'] = path.resolve(
      process.cwd(),
      '@daveyplate/better-auth-ui/index.tsx'
    );
    config.resolve.alias['better-auth'] = path.resolve(
      process.cwd(),
      'better-auth'
    );
    config.resolve.alias['better-auth/providers'] = path.resolve(
      process.cwd(),
      'better-auth/providers.ts'
    );
    config.resolve.alias['better-auth/next-js'] = path.resolve(
      process.cwd(),
      'better-auth/next-js.ts'
    );
    config.resolve.alias['better-auth/client'] = path.resolve(
      process.cwd(),
      'better-auth/client.ts'
    );
    config.resolve.alias['clsx'] = path.resolve(process.cwd(), 'clsx.ts');
    config.resolve.alias['tailwind-merge'] = path.resolve(process.cwd(), 'tailwind-merge.ts');
    config.resolve.alias['class-variance-authority'] = path.resolve(
      process.cwd(),
      'class-variance-authority.ts'
    );
    config.resolve.alias['@radix-ui/react-slot'] = path.resolve(process.cwd(), '@radix-ui/react-slot/index.tsx');
    config.resolve.alias['@radix-ui/react-popover'] = path.resolve(
      process.cwd(),
      '@radix-ui/react-popover/index.tsx'
    );
    aliasWhenMissing(config, 'react-day-picker', 'stubs/react-day-picker.tsx', 'react-day-picker$');
    aliasWhenMissing(config, 'react-day-picker/dist/style.css', 'stubs/react-day-picker.css');
    config.resolve.alias['@radix-ui/react-scroll-area'] = path.resolve(
      process.cwd(),
      '@radix-ui/react-scroll-area/index.tsx'
    );
    config.resolve.alias['@radix-ui/react-dialog'] = path.resolve(
      process.cwd(),
      '@radix-ui/react-dialog/index.tsx'
    );
    config.resolve.alias['geist/font/sans'] = path.resolve(process.cwd(), 'geist/font/sans.ts');
    config.resolve.alias['geist/font/mono'] = path.resolve(process.cwd(), 'geist/font/mono.ts');
    config.resolve.alias['@vercel/analytics/next'] = path.resolve(
      process.cwd(),
      '@vercel/analytics/next.tsx'
    );
    config.resolve.alias['framer-motion'] = path.resolve(process.cwd(), 'framer-motion/index.tsx');
    config.resolve.alias['recharts'] = path.resolve(process.cwd(), 'recharts/index.tsx');
    config.resolve.alias['swr'] = path.resolve(process.cwd(), 'swr/index.ts');
    config.resolve.alias['tailwindcss'] = path.resolve(process.cwd(), 'stubs/tailwindcss.css');
    config.resolve.alias['tw-animate-css'] = path.resolve(process.cwd(), 'stubs/tw-animate-css.css');
    aliasWhenMissing(config, 'exceljs', 'stubs/exceljs.ts');
    aliasWhenMissing(config, 'pdf-lib', 'stubs/pdf-lib.ts');
    aliasWhenMissing(config, 'xlsx', 'stubs/xlsx.ts');
    aliasWhenMissing(config, 'xlsx/xlsx.mjs', 'stubs/xlsx.mjs');
    return config;
  },
};
export default nextConfig;
