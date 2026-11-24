/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://fokus-cyan-six.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/login", "/register", "/account", "/welcome"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
