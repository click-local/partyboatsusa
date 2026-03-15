import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { boats, destinationPages } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getAllSpeciesWithBoatCounts, getAllSpeciesStateCombinations, getAllSpeciesCategories } from "@/lib/db/queries/boats";
import { getStatesWithListings, getCitiesWithBoats } from "@/lib/db/queries/states";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/destinations`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/brag-board`, changeFrequency: "daily", priority: 0.6, lastModified: now },
    { url: `${SITE_URL}/terms-of-use`, changeFrequency: "yearly", priority: 0.2, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2, lastModified: new Date("2025-01-01") },
  ];

  // Dynamic boat pages - use most recent review/brag photo date as lastModified proxy
  let boatPages: MetadataRoute.Sitemap = [];
  try {
    const allBoats = await db
      .select({
        slug: boats.slug,
        lastActivity: sql<Date>`GREATEST(
          (SELECT MAX(created_at) FROM reviews WHERE reviews.boat_id = ${boats.id}),
          (SELECT MAX(submitted_at) FROM brag_board_photos WHERE brag_board_photos.boat_id = ${boats.id}),
          '2025-01-01'::timestamp
        )`,
      })
      .from(boats)
      .where(eq(boats.isPublished, true));

    boatPages = allBoats.map((boat) => ({
      url: `${SITE_URL}/boats/${boat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: boat.lastActivity ? new Date(boat.lastActivity) : new Date("2025-01-01"),
    }));
  } catch {
    // DB not connected yet - skip dynamic pages
  }

  // State pages - only states with published boats
  let statePages: MetadataRoute.Sitemap = [];
  try {
    const statesWithBoats = await getStatesWithListings();

    const latestDestUpdate = await db
      .select({ updatedAt: destinationPages.updatedAt })
      .from(destinationPages)
      .where(eq(destinationPages.type, "state"))
      .orderBy(desc(destinationPages.updatedAt))
      .limit(1);

    const stateLastMod = latestDestUpdate[0]?.updatedAt || new Date("2025-01-01");

    statePages = statesWithBoats.map((row) => ({
      url: `${SITE_URL}/states/${row.state.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: stateLastMod,
    }));
  } catch {
    // DB not connected yet
  }

  // City pages - only cities with published boats
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const citiesWithBoats = await getCitiesWithBoats();
    cityPages = citiesWithBoats.map((c) => ({
      url: `${SITE_URL}/states/${c.stateSlug}/${c.citySlug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: now,
    }));
  } catch {
    // DB not connected yet
  }

  // Species pages
  let speciesPages: MetadataRoute.Sitemap = [];
  try {
    const allSpecies = await getAllSpeciesWithBoatCounts();

    speciesPages = [
      { url: `${SITE_URL}/species`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
      ...allSpecies.map((sp) => ({
        url: `${SITE_URL}/species/${sp.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        lastModified: now,
      })),
    ];
  } catch {
    // DB not connected yet
  }

  // Species category pages (e.g., /species/category/saltwater)
  let speciesCategoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getAllSpeciesCategories();
    speciesCategoryPages = categories.map((cat) => ({
      url: `${SITE_URL}/species/category/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: now,
    }));
  } catch {
    // DB not connected yet
  }

  // Species-by-state pages (e.g., /species/red-snapper/florida)
  let speciesStatePages: MetadataRoute.Sitemap = [];
  try {
    const combos = await getAllSpeciesStateCombinations();
    speciesStatePages = combos.map((c) => ({
      url: `${SITE_URL}/species/${c.speciesSlug}/${c.stateSlug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      lastModified: now,
    }));
  } catch {
    // DB not connected yet
  }

  return [...staticPages, ...boatPages, ...statePages, ...cityPages, ...speciesPages, ...speciesCategoryPages, ...speciesStatePages];
}
