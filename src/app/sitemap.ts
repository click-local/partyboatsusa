import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { boats, states, cities, destinationPages, tripTypes } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getAllSpeciesWithBoatCounts, getAllSpeciesStateCombinations } from "@/lib/db/queries/boats";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/destinations`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/brag-board`, changeFrequency: "daily", priority: 0.6, lastModified: now },
    { url: `${SITE_URL}/terms-of-use`, changeFrequency: "yearly", priority: 0.2, lastModified: new Date("2025-01-01") },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2, lastModified: new Date("2025-01-01") },
  ];

  // Dynamic boat pages -use most recent review/brag photo date as lastModified proxy
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
    // DB not connected yet -skip dynamic pages
  }

  // State pages -use latest destination page update
  let statePages: MetadataRoute.Sitemap = [];
  try {
    const allStates = await db
      .select({
        slug: states.slug,
      })
      .from(states);

    // Get the most recent destination page update for states
    const latestDestUpdate = await db
      .select({ updatedAt: destinationPages.updatedAt })
      .from(destinationPages)
      .where(eq(destinationPages.type, "state"))
      .orderBy(desc(destinationPages.updatedAt))
      .limit(1);

    const stateLastMod = latestDestUpdate[0]?.updatedAt || new Date("2025-01-01");

    statePages = allStates.map((state) => ({
      url: `${SITE_URL}/states/${state.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: stateLastMod,
    }));
  } catch {
    // DB not connected yet
  }

  // City pages
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const allCities = await db.select({ slug: cities.slug }).from(cities);

    const latestCityDestUpdate = await db
      .select({ updatedAt: destinationPages.updatedAt })
      .from(destinationPages)
      .where(eq(destinationPages.type, "city"))
      .orderBy(desc(destinationPages.updatedAt))
      .limit(1);

    const cityLastMod = latestCityDestUpdate[0]?.updatedAt || now;

    cityPages = allCities.map((city) => ({
      url: `${SITE_URL}/locations/${city.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: cityLastMod,
    }));
  } catch {
    // DB not connected yet
  }

  // Trip type pages
  let tripTypePages: MetadataRoute.Sitemap = [];
  try {
    const allTripTypes = await db
      .select({ slug: tripTypes.slug })
      .from(tripTypes)
      .orderBy(tripTypes.sortOrder);

    tripTypePages = [
      { url: `${SITE_URL}/trip-types`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
      ...allTripTypes.map((tt) => ({
        url: `${SITE_URL}/trip-types/${tt.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        lastModified: now,
      })),
    ];
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

  return [...staticPages, ...boatPages, ...statePages, ...cityPages, ...tripTypePages, ...speciesPages, ...speciesStatePages];
}
