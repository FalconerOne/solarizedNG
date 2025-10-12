/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Enable automatic sitemap + robots.txt generation
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: '/robots.txt',
      },
    ];
  },
};

module.exports = nextConfig;
