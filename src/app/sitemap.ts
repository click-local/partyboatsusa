import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { boats, states, cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/brag-board`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/terms-of-use`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic boat pages
  let boatPages: MetadataRoute.Sitemap = [];
  try {
    const allBoats = await db
      .select({ slug: boats.slug })
      .from(boats)
      .where(eq(boats.isPublished, true));

    boatPages = allBoats.map((boat) => ({
      url: `${SITE_URL}/boats/${boat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not connected yet — skip dynamic pages
  }

  // State pages
  let statePages: MetadataRoute.Sitemap = [];
  try {
    const allStates = await db.select({ slug: states.slug }).from(states);
    statePages = allStates.map((state) => ({
      url: `${SITE_URL}/states/${state.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not connected yet
  }

  // City pages
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const allCities = await db.select({ slug: cities.slug }).from(cities);
    cityPages = allCities.map((city) => ({
      url: `${SITE_URL}/locations/${city.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not connected yet
  }

  return [...staticPages, ...boatPages, ...statePages, ...cityPages];
}
