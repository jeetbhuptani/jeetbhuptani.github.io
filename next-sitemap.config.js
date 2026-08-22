/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://jeetbhuptani.tech',
  generateRobotsTxt: true,
  // Route handlers and OG image endpoints were being listed as pages. They
  // return JSON/PNG, so indexing them is pure noise; /admin is private.
  exclude: ['/api/*', '/admin', '/admin/*', '/opengraph-image', '/*/opengraph-image'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] }],
  },
}
