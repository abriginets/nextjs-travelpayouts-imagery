/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/assets/image/airline/:type/:width/:iata.:extension',
          destination: '/api/airline/type/:type/width/:width/code/:iata/extension/:extension',
        },
        {
          source: '/assets/image/location/:width/:height/:iata.:extension',
          destination: '/api/location/code/:iata/width/:width/height/:height/extension/:extension',
        },
      ],
    };
  },
};

module.exports = nextConfig;
