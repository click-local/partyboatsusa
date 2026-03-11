import { db } from "@/lib/db";
import { states, cities, boats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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
  return db.select().from(cities).where(eq(cities.stateCode, stateCode)).orderBy(cities.name);
}

export async function getCityBySlug(slug: string) {
  const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
  return city ?? null;
}
