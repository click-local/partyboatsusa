import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

// AI crawlers and known scraper bots to block
const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Bytespider",
  "PetalBot",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Applebot-Extended",
  "PerplexityBot",
  "YouBot",
  "Scrapy",
  "DataForSeoBot",
  "AhrefsBot",
  "SemrushBot",
  "DotBot",
  "MJ12bot",
  "BLEXBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Block AI crawlers and scrapers
      ...BLOCKED_BOTS.map((bot) => ({
        userAgent: bot,
        disallow: ["/"],
      })),
      // Allow legitimate search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/operator/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
