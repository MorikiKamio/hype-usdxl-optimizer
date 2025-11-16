/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback['@react-native-async-storage/async-storage'] = false;
    config.resolve.fallback['pino-pretty'] = false;
    return config;
  },
};

module.exports = nextConfig;
