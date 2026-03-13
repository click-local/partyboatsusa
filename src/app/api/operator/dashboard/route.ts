import { NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boats, reviews, bragBoardPhotos } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { getOperatorPendingPhotos } from "@/lib/db/queries/operators";

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get operator's boats with key fields
  const operatorBoats = await db
    .select({
      id: boats.id,
      name: boats.name,
      slug: boats.slug,
      cityName: boats.cityName,
      stateCode: boats.stateCode,
      isPublished: boats.isPublished,
      rating: boats.rating,
      reviewCount: boats.reviewCount,
      primaryImageUrl: boats.primaryImageUrl,
    })
    .from(boats)
    .where(eq(boats.operatorId, operator.id))
    .orderBy(desc(boats.id));

  const boatIds = operatorBoats.map((b) => b.id);

  // Run remaining queries in parallel
  const [recentReviews, pendingPhotos, photoStats] = await Promise.all([
    // Recent approved reviews (last 5)
    boatIds.length > 0
      ? db
          .select({
            id: reviews.id,
            boatId: reviews.boatId,
            userName: reviews.userName,
            rating: reviews.rating,
            title: reviews.title,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            operatorReply: reviews.operatorReply,
          })
          .from(reviews)
          .where(
            and(
              inArray(reviews.boatId, boatIds),
              eq(reviews.status, "approved")
            )
          )
          .orderBy(desc(reviews.createdAt))
          .limit(5)
      : Promise.resolve([]),

    // Pending brag board photos
    getOperatorPendingPhotos(operator.id),

    // Approved photo count
    boatIds.length > 0
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(bragBoardPhotos)
          .where(
            and(
              inArray(bragBoardPhotos.boatId, boatIds),
              eq(bragBoardPhotos.status, "approved")
            )
          )
      : Promise.resolve([{ count: 0 }]),
  ]);

  // Build boat name lookup for reviews
  const boatMap = Object.fromEntries(
    operatorBoats.map((b) => [b.id, b.name])
  );

  const reviewsWithBoatName = recentReviews.map((r) => ({
    ...r,
    boatName: boatMap[r.boatId] || "Unknown",
  }));

  // Compute aggregate stats
  const totalReviews = operatorBoats.reduce(
    (sum, b) => sum + (b.reviewCount ?? 0),
    0
  );

  let averageRating = 0;
  if (totalReviews > 0) {
    const weightedSum = operatorBoats.reduce(
      (sum, b) =>
        sum +
        (Number(b.rating) || 0) * (b.reviewCount ?? 0),
      0
    );
    averageRating =
      Math.round((weightedSum / totalReviews) * 10) / 10;
  }

  return NextResponse.json({
    operator: {
      id: operator.id,
      email: operator.email,
      companyName: operator.companyName,
      contactName: operator.contactName,
      tier: operator.tier
        ? {
            name: operator.tier.name,
            badgeColor: operator.tier.badgeColor,
            isHighestTier: operator.tier.isHighestTier,
          }
        : null,
    },
    boats: operatorBoats,
    recentReviews: reviewsWithBoatName,
    pendingPhotos,
    stats: {
      totalReviews,
      averageRating,
      approvedPhotoCount: photoStats[0]?.count ?? 0,
      pendingPhotoCount: pendingPhotos.length,
    },
  });
}
