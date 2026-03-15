import { db } from "@/lib/db";
import { states, cities, boats, boatSpecies, species } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

