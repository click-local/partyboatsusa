import { db } from "@/lib/db";
import { states, cities, boats } from "@/lib/db/schema";
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

export async function getCitiesByState(stateCode: string) {
  return db
    .selectDistinct({ id: cities.id, name: cities.name, slug: cities.slug, stateCode: cities.stateCode })
    .from(cities)
    .innerJoin(boats, sql`lower(${boats.cityName}) = lower(${cities.name}) AND ${boats.stateCode} = ${cities.stateCode}`)
    .where(sql`${cities.stateCode} = ${stateCode} AND ${boats.isPublished} = true`)
    .orderBy(cities.name);
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

export async function getCityBySlug(slug: string) {
  const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
  return city ?? null;
}
