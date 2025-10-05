import path from 'path';

const nextConfig = {
  webpack(config) {
    config.resolve.alias['@daveyplate/better-auth-ui'] = path.resolve(
      process.cwd(),
      'better-auth-ui'
    );
    return config;
  },
};

export default nextConfig;
