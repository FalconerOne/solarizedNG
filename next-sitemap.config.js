/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://solarizedng.vercel.app', // ✅ your live URL
  generateRobotsTxt: true,                    // ✅ create robots.txt automatically
  sitemapSize: 7000,                          // optional, splits large sitemaps
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin*'],                       // optional exclusions
};
