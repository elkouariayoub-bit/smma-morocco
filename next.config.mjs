import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function aliasWhenMissing(config, moduleName, stubPath) {
  try {
    require.resolve(moduleName);
  } catch {
    config.resolve.alias[moduleName] = path.resolve(process.cwd(), stubPath);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['exceljs', 'pdf-lib'],
  experimental: {
    serverComponentsExternalPackages: ['exceljs', 'pdf-lib'],
  },
  async redirects() {
    return [
      { source: '/settings/apps', destination: '/settings', permanent: false },
      { source: '/settings/notifications', destination: '/settings', permanent: false },
    ]
  },
  webpack(config) {
    config.resolve.alias['@daveyplate/better-auth-ui'] = path.resolve(
      process.cwd(),
      'better-auth-ui'
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
    config.resolve.alias['clsx'] = path.resolve(process.cwd(), 'stubs/clsx.ts');
    config.resolve.alias['tailwind-merge'] = path.resolve(process.cwd(), 'stubs/tailwind-merge.ts');
    config.resolve.alias['class-variance-authority'] = path.resolve(
      process.cwd(),
      'stubs/class-variance-authority.ts'
    );
    config.resolve.alias['@radix-ui/react-slot'] = path.resolve(process.cwd(), 'stubs/radix-slot.tsx');
    config.resolve.alias['@radix-ui/react-popover'] = path.resolve(
      process.cwd(),
      'stubs/radix-popover.tsx'
    );
    aliasWhenMissing(config, '@radix-ui/react-scroll-area', 'stubs/radix-scroll-area.tsx');
    config.resolve.alias['@radix-ui/react-dialog'] = path.resolve(
      process.cwd(),
      'stubs/radix-dialog.tsx'
    );
    config.resolve.alias['geist/font/sans'] = path.resolve(process.cwd(), 'stubs/geist-font-sans.ts');
    config.resolve.alias['geist/font/mono'] = path.resolve(process.cwd(), 'stubs/geist-font-mono.ts');
    config.resolve.alias['@vercel/analytics/next'] = path.resolve(
      process.cwd(),
      'stubs/vercel-analytics.tsx'
    );
    config.resolve.alias['framer-motion'] = path.resolve(process.cwd(), 'stubs/framer-motion.tsx');
    config.resolve.alias['recharts'] = path.resolve(process.cwd(), 'stubs/recharts.tsx');
    config.resolve.alias['swr'] = path.resolve(process.cwd(), 'stubs/swr.ts');
    config.resolve.alias['tailwindcss'] = path.resolve(process.cwd(), 'stubs/tailwindcss.css');
    config.resolve.alias['tw-animate-css'] = path.resolve(process.cwd(), 'stubs/tw-animate-css.css');
    aliasWhenMissing(config, '@radix-ui/react-select', 'stubs/radix-select.tsx');
    aliasWhenMissing(config, '@radix-ui/react-separator', 'stubs/radix-separator.tsx');
    aliasWhenMissing(config, 'react-hook-form', 'stubs/react-hook-form.ts');
    aliasWhenMissing(config, '@hookform/resolvers/zod', 'stubs/hookform-resolvers-zod.ts');
    aliasWhenMissing(config, 'zod', 'stubs/zod.ts');
    aliasWhenMissing(config, 'sonner', 'stubs/sonner.tsx');
    aliasWhenMissing(config, 'exceljs', 'stubs/exceljs.ts');
    aliasWhenMissing(config, 'pdf-lib', 'stubs/pdf-lib.ts');
    aliasWhenMissing(config, 'xlsx', 'stubs/xlsx.ts');
    aliasWhenMissing(config, 'xlsx/xlsx.mjs', 'stubs/xlsx.mjs');
    return config;
  },
};
export default nextConfig;
