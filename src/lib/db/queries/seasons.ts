import { db } from "@/lib/db";
import { speciesStateSeasons } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export type SeasonRating = "peak" | "good" | "fair" | "off";

export interface MonthSeason {
  month: number;
  rating: SeasonRating;
  notes: string | null;
}

export async function getSpeciesStateSeasons(
  speciesId: number,
  stateCode: string
): Promise<MonthSeason[]> {
  const rows = await db
    .select({
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
    .orderBy(asc(speciesStateSeasons.month));

  return rows.map((r) => ({
    month: r.month,
    rating: r.rating as SeasonRating,
    notes: r.notes,
  }));
}
