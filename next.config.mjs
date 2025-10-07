import path from 'path';

const nextConfig = {
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
    config.resolve.alias['tailwindcss'] = path.resolve(process.cwd(), 'stubs/tailwindcss.css');
    config.resolve.alias['tw-animate-css'] = path.resolve(process.cwd(), 'stubs/tw-animate-css.css');
    return config;
  },
};

export default nextConfig;
