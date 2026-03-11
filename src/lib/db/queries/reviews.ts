import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getReviewsByBoat(boatId: number, approvedOnly = true, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const conditions = [eq(reviews.boatId, boatId)];

  if (approvedOnly) {
    conditions.push(eq(reviews.status, "approved"));
  }

  const where = and(...conditions);

  const [results, countResult] = await Promise.all([
    db.select().from(reviews).where(where).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(reviews).where(where),
  ]);

  return {
    reviews: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  };
}

export async function getBoatRatingStats(boatId: number) {
  const [stats] = await db
    .select({
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.boatId, boatId), eq(reviews.status, "approved")));

  return {
    averageRating: Number(stats?.averageRating ?? 0),
    reviewCount: Number(stats?.reviewCount ?? 0),
  };
}
