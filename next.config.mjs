import path from 'path';

const nextConfig = {
  webpack(config) {
    config.resolve.alias['@supabase/auth-ui-react'] = path.resolve(
      process.cwd(),
      'supabase/auth-ui-react'
    );
    config.resolve.alias['@supabase/auth-ui-shared'] = path.resolve(
      process.cwd(),
      'supabase/auth-ui-shared'
    );
    return config;
  },
};

export default nextConfig;
