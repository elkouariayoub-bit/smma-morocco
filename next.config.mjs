import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function ensureAliasMap(config) {
  if (!config.resolve) {
    config.resolve = {};
  }

  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }

  return config.resolve.alias;
}

function aliasWhenMissing(config, moduleName, stubPath) {
  const alias = ensureAliasMap(config);

  try {
    require.resolve(moduleName);
  } catch {
    alias[moduleName] = path.resolve(process.cwd(), stubPath);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['exceljs', 'pdf-lib'],
  },
  webpack(config) {
    const alias = ensureAliasMap(config);
    alias['@daveyplate/better-auth-ui'] = path.resolve(
      process.cwd(),
      'better-auth-ui'
    );
    alias['better-auth'] = path.resolve(
      process.cwd(),
      'better-auth'
    );
    alias['better-auth/providers'] = path.resolve(
      process.cwd(),
      'better-auth/providers.ts'
    );
    alias['better-auth/next-js'] = path.resolve(
      process.cwd(),
      'better-auth/next-js.ts'
    );
    alias['better-auth/client'] = path.resolve(
      process.cwd(),
      'better-auth/client.ts'
    );
    alias['clsx'] = path.resolve(process.cwd(), 'stubs/clsx.ts');
    alias['tailwind-merge'] = path.resolve(process.cwd(), 'stubs/tailwind-merge.ts');
    alias['class-variance-authority'] = path.resolve(
      process.cwd(),
      'stubs/class-variance-authority.ts'
    );
    alias['@radix-ui/react-slot'] = path.resolve(process.cwd(), 'stubs/radix-slot.tsx');
    alias['@radix-ui/react-popover'] = path.resolve(
      process.cwd(),
      'stubs/radix-popover.tsx'
    );
    aliasWhenMissing(config, '@radix-ui/react-scroll-area', 'stubs/radix-scroll-area.tsx');
    alias['@radix-ui/react-dialog'] = path.resolve(
      process.cwd(),
      'stubs/radix-dialog.tsx'
    );
    alias['geist/font/sans'] = path.resolve(process.cwd(), 'stubs/geist-font-sans.ts');
    alias['geist/font/mono'] = path.resolve(process.cwd(), 'stubs/geist-font-mono.ts');
    alias['@vercel/analytics/next'] = path.resolve(
      process.cwd(),
      'stubs/vercel-analytics.tsx'
    );
    alias['framer-motion'] = path.resolve(process.cwd(), 'stubs/framer-motion.tsx');
    alias['recharts'] = path.resolve(process.cwd(), 'stubs/recharts.tsx');
    alias['swr'] = path.resolve(process.cwd(), 'stubs/swr.ts');
    alias['tailwindcss'] = path.resolve(process.cwd(), 'stubs/tailwindcss.css');
    alias['tw-animate-css'] = path.resolve(process.cwd(), 'stubs/tw-animate-css.css');
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
