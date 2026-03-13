import { NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { reviews, boats } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all boats owned by this operator
  const operatorBoats = await db
    .select({ id: boats.id, name: boats.name })
    .from(boats)
    .where(eq(boats.operatorId, operator.id));

  if (operatorBoats.length === 0) {
    return NextResponse.json({ reviews: [], boats: [] });
  }

  const boatIds = operatorBoats.map((b) => b.id);

  // Get all approved reviews for operator's boats
  const allReviews = await db
    .select()
    .from(reviews)
    .where(and(inArray(reviews.boatId, boatIds), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));

  return NextResponse.json({
    reviews: allReviews,
    boats: operatorBoats,
    isPro: operator.tier?.isHighestTier || false,
  });
}
