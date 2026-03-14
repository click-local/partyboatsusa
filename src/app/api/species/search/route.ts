import { NextRequest, NextResponse } from "next/server";
import { searchSpeciesByName, getAllSpeciesCategories } from "@/lib/db/queries/boats";
import { db } from "@/lib/db";
import { species, speciesCategories, speciesAliases } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  // If no query, return all species grouped by category (for browse mode)
  if (!query || query.trim().length === 0) {
    try {
      const [allSpecies, categories] = await Promise.all([
        db
          .select({
            id: species.id,
            name: species.name,
            slug: species.slug,
            scientificName: species.scientificName,
            categoryId: species.categoryId,
            categoryName: speciesCategories.name,
          })
          .from(species)
          .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
          .orderBy(speciesCategories.sortOrder, asc(species.name)),
        getAllSpeciesCategories(),
      ]);

      return NextResponse.json({ species: allSpecies, categories });
    } catch {
      return NextResponse.json({ species: [], categories: [] });
    }
  }

  // Search by query (name + aliases)
  const results = await searchSpeciesByName(query);
  return NextResponse.json({ species: results });
}
