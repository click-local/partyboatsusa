import { NextRequest, NextResponse } from "next/server";
import { searchBoats } from "@/lib/db/queries/boats";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

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
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
