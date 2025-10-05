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
    return config;
  },
};

export default nextConfig;
