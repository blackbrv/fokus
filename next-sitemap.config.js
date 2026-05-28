/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://fokus-cyan-six.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/login", "/register"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
