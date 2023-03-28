/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/emoji",
        destination: "/api/emoji/route.ts",
      },
    ];
  },
};

module.exports = nextConfig;