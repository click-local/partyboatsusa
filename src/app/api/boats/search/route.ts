import { NextRequest, NextResponse } from "next/server";
import { searchBoats, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import { db } from "@/lib/db";
import { boats, states, amenities, boatAmenities } from "@/lib/db/schema";
import { eq, sql, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Return filter metadata (states & amenities that have listings)
  if (params.get("meta") === "filters") {
    const [statesWithListings, amenitiesWithListings] = await Promise.all([
      db.select({ code: states.code, name: states.name })
        .from(states)
        .where(sql`${states.code} IN (SELECT DISTINCT ${boats.stateCode} FROM ${boats} WHERE ${boats.isPublished} = true)`)
        .orderBy(asc(states.name)),
      db.select({ id: amenities.id, name: amenities.name, slug: amenities.slug })
        .from(amenities)
        .where(sql`${amenities.id} IN (SELECT DISTINCT ${boatAmenities.amenityId} FROM ${boatAmenities})`)
        .orderBy(asc(amenities.sortOrder)),
    ]);
    return NextResponse.json({ states: statesWithListings, amenities: amenitiesWithListings });
  }

  const filters = {
    query: params.get("q") || undefined,
    states: params.get("states")?.split(",").filter(Boolean) || undefined,
    city: params.get("city") || undefined,
    tripTypes: params.get("tripTypes")?.split(",").filter(Boolean) || undefined,
    amenities: params.get("amenities")?.split(",").filter(Boolean) || undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    minCapacity: params.get("minCapacity") ? Number(params.get("minCapacity")) : undefined,
    maxCapacity: params.get("maxCapacity") ? Number(params.get("maxCapacity")) : undefined,
    minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
    sort: params.get("sort") || undefined,
    page: params.get("page") ? Number(params.get("page")) : 1,
    limit: params.get("limit") ? Number(params.get("limit")) : 18,
  };

  try {
    const results = await searchBoats(filters);
    const tierBadges = await getTierBadgesForBoats(results.boats.map((b) => b.operatorId));
    const badgesObj: Record<number, { name: string; color: string }> = {};
    tierBadges.forEach((v, k) => { badgesObj[k] = v; });
    return NextResponse.json({ ...results, tierBadges: badgesObj });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
