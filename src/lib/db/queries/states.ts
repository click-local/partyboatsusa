import { db } from "@/lib/db";
import { states, cities, boats, boatSpecies, species, boatAmenities, amenities } from "@/lib/db/schema";
import { and, eq, sql, desc, asc } from "drizzle-orm";

export async function getStates() {
  return db.select().from(states).orderBy(states.name);
}

export async function getStatesWithListings() {
  return db
    .selectDistinct({ state: states })
    .from(states)
    .innerJoin(boats, eq(boats.stateCode, states.code))
    .where(eq(boats.isPublished, true))
    .orderBy(states.name);
}

export async function getStateByCode(code: string) {
  const [state] = await db.select().from(states).where(eq(states.code, code));
  return state ?? null;
}

export async function getStateBySlug(slug: string) {
  const [state] = await db.select().from(states).where(eq(states.slug, slug));
  return state ?? null;
}

export async function getCities() {
  return db.select().from(cities).orderBy(cities.name);
}

export async function getAllStatesWithBoatCounts() {
  return db
    .select({
      id: states.id,
      name: states.name,
      code: states.code,
      slug: states.slug,
      boatCount: sql<number>`count(${boats.id})`.as("boat_count"),
    })
    .from(states)
    .leftJoin(
      boats,
      and(eq(boats.stateCode, states.code), eq(boats.isPublished, true))
    )
    .groupBy(states.id, states.name, states.code, states.slug)
    .orderBy(states.name);
}

export interface StateSpecies {
  name: string;
  slug: string;
  imageUrl: string | null;
}

/**
 * Get top species for each state (by number of boats targeting that species).
 * Returns a map of stateCode -> array of species info (top N).
 */
export async function getTopSpeciesByState(limit = 5): Promise<Map<string, StateSpecies[]>> {
  const rows = await db
    .select({
      stateCode: boats.stateCode,
      speciesName: species.name,
      speciesSlug: species.slug,
      speciesImage: species.imageUrl,
      count: sql<number>`count(DISTINCT ${boats.id})`.as("cnt"),
    })
    .from(boatSpecies)
    .innerJoin(boats, and(eq(boatSpecies.boatId, boats.id), eq(boats.isPublished, true)))
    .innerJoin(species, eq(boatSpecies.speciesId, species.id))
    .groupBy(boats.stateCode, species.name, species.slug, species.imageUrl)
    .orderBy(boats.stateCode, sql`cnt DESC`);

  const result = new Map<string, StateSpecies[]>();
  for (const r of rows) {
    const code = r.stateCode;
    if (!result.has(code)) result.set(code, []);
    const arr = result.get(code)!;
    if (arr.length < limit) {
      arr.push({ name: r.speciesName, slug: r.speciesSlug, imageUrl: r.speciesImage });
    }
  }
  return result;
}

/**
 * Get all cities that have at least one published boat.
 * Used for sitemap generation and city page generateStaticParams.
 */
export async function getCitiesWithBoats() {
  return db
    .selectDistinct({
      cityId: cities.id,
      cityName: cities.name,
      citySlug: cities.slug,
      stateCode: cities.stateCode,
      stateSlug: states.slug,
      stateName: states.name,
    })
    .from(cities)
    .innerJoin(states, eq(cities.stateCode, states.code))
    .innerJoin(
      boats,
      and(
        eq(boats.stateCode, cities.stateCode),
        sql`LOWER(${boats.cityName}) = LOWER(${cities.name})`,
        eq(boats.isPublished, true)
      )
    )
    .orderBy(states.name, cities.name);
}

/**
 * Get cities with published boats for a specific state.
 * Used for cross-linking on state pages.
 */
export async function getCitiesForState(stateCode: string) {
  return db
    .selectDistinct({
      cityName: cities.name,
      citySlug: cities.slug,
    })
    .from(cities)
    .innerJoin(
      boats,
      and(
        eq(boats.stateCode, cities.stateCode),
        sql`LOWER(${boats.cityName}) = LOWER(${cities.name})`,
        eq(boats.isPublished, true)
      )
    )
    .where(eq(cities.stateCode, stateCode))
    .orderBy(cities.name);
}

/**
 * Get boats for a specific city page.
 */
export async function getBoatsByCity(stateSlug: string, citySlug: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const [st] = await db.select().from(states).where(eq(states.slug, stateSlug)).limit(1);
  if (!st) return null;

  const [city] = await db
    .select()
    .from(cities)
    .where(and(eq(cities.slug, citySlug), eq(cities.stateCode, st.code)))
    .limit(1);
  if (!city) return null;

  const where = and(
    eq(boats.isPublished, true),
    eq(boats.stateCode, st.code),
    sql`LOWER(${boats.cityName}) = LOWER(${city.name})`
  );

  const [results, countResult] = await Promise.all([
    db.select().from(boats).where(where).orderBy(desc(boats.rating)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(boats).where(where),
  ]);

  const nearbyCities = await db
    .selectDistinct({
      cityName: cities.name,
      citySlug: cities.slug,
    })
    .from(cities)
    .innerJoin(
      boats,
      and(
        eq(boats.stateCode, cities.stateCode),
        sql`LOWER(${boats.cityName}) = LOWER(${cities.name})`,
        eq(boats.isPublished, true)
      )
    )
    .where(
      and(
        eq(cities.stateCode, st.code),
        sql`${cities.id} != ${city.id}`
      )
    )
    .orderBy(cities.name)
    .limit(12);

  return {
    state: st,
    city,
    boats: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    nearbyCities,
  };
}

/**
 * Enriched city page data with aggregated species, amenities, pricing, and ratings.
 */
export async function getCityPageData(stateSlug: string, citySlug: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  // Resolve state + city
  const [st] = await db.select().from(states).where(eq(states.slug, stateSlug)).limit(1);
  if (!st) return null;

  const [city] = await db
    .select()
    .from(cities)
    .where(and(eq(cities.slug, citySlug), eq(cities.stateCode, st.code)))
    .limit(1);
  if (!city) return null;

  const boatWhere = and(
    eq(boats.isPublished, true),
    eq(boats.stateCode, st.code),
    sql`LOWER(${boats.cityName}) = LOWER(${city.name})`
  );

  const [
    boatResults,
    countResult,
    citySpecies,
    cityAmenities,
    priceResult,
    capacityResult,
    ratingResult,
    nearbyCities,
  ] = await Promise.all([
    // Boats
    db.select().from(boats).where(boatWhere).orderBy(desc(boats.rating)).limit(limit).offset(offset),
    // Count
    db.select({ count: sql<number>`count(*)` }).from(boats).where(boatWhere),
    // Aggregated species
    db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        imageUrl: species.imageUrl,
        seasonInfo: species.seasonInfo,
        habitat: species.habitat,
        fightRating: species.fightRating,
        boatCount: sql<number>`count(DISTINCT ${boats.id})`.as("boat_count"),
      })
      .from(boatSpecies)
      .innerJoin(boats, and(eq(boatSpecies.boatId, boats.id), boatWhere))
      .innerJoin(species, eq(boatSpecies.speciesId, species.id))
      .groupBy(species.id, species.name, species.slug, species.imageUrl, species.seasonInfo, species.habitat, species.fightRating)
      .orderBy(sql`boat_count DESC`, species.name),
    // Aggregated amenities
    db
      .select({
        id: amenities.id,
        name: amenities.name,
        slug: amenities.slug,
        icon: amenities.icon,
        boatCount: sql<number>`count(DISTINCT ${boats.id})`.as("boat_count"),
      })
      .from(boatAmenities)
      .innerJoin(boats, and(eq(boatAmenities.boatId, boats.id), boatWhere))
      .innerJoin(amenities, eq(boatAmenities.amenityId, amenities.id))
      .groupBy(amenities.id, amenities.name, amenities.slug, amenities.icon, amenities.sortOrder)
      .orderBy(asc(amenities.sortOrder), amenities.name),
    // Price range
    db
      .select({
        minPrice: sql<number>`MIN(${boats.minPricePerPerson})`,
        maxPrice: sql<number>`MAX(${boats.minPricePerPerson})`,
      })
      .from(boats)
      .where(and(boatWhere, sql`${boats.minPricePerPerson} > 0`)),
    // Capacity range
    db
      .select({
        minCapacity: sql<number>`MIN(${boats.capacity})`,
        maxCapacity: sql<number>`MAX(${boats.capacity})`,
      })
      .from(boats)
      .where(boatWhere),
    // Rating stats
    db
      .select({
        avgRating: sql<number>`AVG(CASE WHEN ${boats.rating} > 0 THEN ${boats.rating} END)`,
        totalReviews: sql<number>`COALESCE(SUM(${boats.reviewCount}), 0)`,
      })
      .from(boats)
      .where(boatWhere),
    // Nearby cities
    db
      .selectDistinct({
        cityName: cities.name,
        citySlug: cities.slug,
        boatCount: sql<number>`count(DISTINCT ${boats.id})`.as("boat_count"),
      })
      .from(cities)
      .innerJoin(
        boats,
        and(
          eq(boats.stateCode, cities.stateCode),
          sql`LOWER(${boats.cityName}) = LOWER(${cities.name})`,
          eq(boats.isPublished, true)
        )
      )
      .where(and(eq(cities.stateCode, st.code), sql`${cities.id} != ${city.id}`))
      .groupBy(cities.name, cities.slug)
      .orderBy(sql`boat_count DESC`, cities.name)
      .limit(12),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    state: st,
    city,
    boats: boatResults,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    species: citySpecies,
    amenities: cityAmenities,
    priceRange: priceResult[0]?.minPrice
      ? { min: Number(priceResult[0].minPrice), max: Number(priceResult[0].maxPrice) }
      : null,
    capacityRange: capacityResult[0]?.minCapacity
      ? { min: Number(capacityResult[0].minCapacity), max: Number(capacityResult[0].maxCapacity) }
      : null,
    ratingStats: {
      avg: Number(ratingResult[0]?.avgRating ?? 0),
      totalReviews: Number(ratingResult[0]?.totalReviews ?? 0),
    },
    nearbyCities,
  };
}

