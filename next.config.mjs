import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const nextVersion = require('next/package.json').version;
const [major, minor = '0'] = nextVersion.split('.');
const supportsServerExternalPackages =
  Number(major) > 14 || (Number(major) === 14 && Number(minor) >= 3);

function aliasWhenMissing(config, moduleName, stubPath) {
  try {
    require.resolve(moduleName);
  } catch {
    config.resolve.alias[moduleName] = path.resolve(process.cwd(), stubPath);
  }
}

const nextConfig = {
  experimental: {
    // Ensure these server-only packages can be bundled/loaded on Vercel Functions
    serverComponentsExternalPackages: ['exceljs', 'xlsx', 'pdf-lib'],
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
    config.resolve.alias['@radix-ui/react-scroll-area'] = path.resolve(
      process.cwd(),
      'stubs/radix-scroll-area.tsx'
    );
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
    aliasWhenMissing(config, 'exceljs', 'stubs/exceljs.ts');
    aliasWhenMissing(config, 'pdf-lib', 'stubs/pdf-lib.ts');
    aliasWhenMissing(config, 'xlsx', 'stubs/xlsx.ts');
    aliasWhenMissing(config, 'xlsx/xlsx.mjs', 'stubs/xlsx.mjs');
    return config;
  },
};

if (supportsServerExternalPackages) {
  nextConfig.serverExternalPackages = ['exceljs', 'xlsx', 'pdf-lib'];
}

export default nextConfig;
