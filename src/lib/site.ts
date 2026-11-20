import "server-only";

export const SITE_NAME = "WhereToGo";

// Absolute base for share links, sitemap and structured data. Set SITE_URL
// in production; on Vercel the production domain is used automatically.
export function siteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url =
    process.env.SITE_URL ||
    (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}
