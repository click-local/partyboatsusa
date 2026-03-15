import { db } from "@/lib/db";
import { speciesStateSeasons } from "@/lib/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";

export type SeasonRating = "peak" | "good" | "fair" | "off" | "closed";

export interface MonthSeason {
  month: number;
  rating: SeasonRating;
  notes: string | null;
}

export interface RegionSeasons {
  region: string | null;
  months: MonthSeason[];
}

/**
 * Get fishing seasons for a species in a state, grouped by region.
 * Returns an array of region groups. If no region data exists,
 * returns a single group with region=null.
 */
export async function getSpeciesStateSeasons(
  speciesId: number,
  stateCode: string
): Promise<RegionSeasons[]> {
  const rows = await db
    .select({
      region: speciesStateSeasons.region,
      month: speciesStateSeasons.month,
      rating: speciesStateSeasons.rating,
      notes: speciesStateSeasons.notes,
    })
    .from(speciesStateSeasons)
    .where(
      and(
        eq(speciesStateSeasons.speciesId, speciesId),
        eq(speciesStateSeasons.stateCode, stateCode)
      )
    )
    .orderBy(asc(speciesStateSeasons.region), asc(speciesStateSeasons.month));

  if (rows.length === 0) return [];

  // Group by region
  const regionMap = new Map<string | null, MonthSeason[]>();
  for (const r of rows) {
    const region = r.region ?? null;
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push({
      month: r.month,
      rating: r.rating as SeasonRating,
      notes: r.notes,
    });
  }

  return Array.from(regionMap.entries()).map(([region, months]) => ({
    region,
    months,
  }));
}
