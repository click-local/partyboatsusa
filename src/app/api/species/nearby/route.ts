import { NextRequest, NextResponse } from "next/server";
import { getNearbyBoatsBySpecies, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000, prefix: "species-nearby" });
  if (limited) return limited;

  const params = request.nextUrl.searchParams;
  const speciesId = Number(params.get("speciesId"));
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const stateCode = params.get("stateCode") || undefined;
  const limit = Math.min(Number(params.get("limit")) || 5, 20);

  if (!speciesId || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "speciesId, lat, and lng are required" }, { status: 400 });
  }

  try {
    const results = await getNearbyBoatsBySpecies(speciesId, lat, lng, stateCode, limit);
    const tierBadges = await getTierBadgesForBoats(results.map((b) => b.operatorId));
    const badgesObj: Record<number, { name: string; color: string }> = {};
    tierBadges.forEach((v, k) => { badgesObj[k] = v; });
    return NextResponse.json({ boats: results, tierBadges: badgesObj });
  } catch (error) {
    console.error("Species nearby error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
