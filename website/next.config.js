/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable polling for file watching in Docker (Windows compatibility)
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before reloading
    }
    return config
  },
}

module.exports = nextConfig

