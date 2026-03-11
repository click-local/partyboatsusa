import { db } from "@/lib/db";
import { bragBoardPhotos, boats } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getBragBoardPhotos(page = 1, limit = 24) {
  const offset = (page - 1) * limit;
  const where = eq(bragBoardPhotos.status, "approved");

  const [results, countResult] = await Promise.all([
    db
      .select({
        photo: bragBoardPhotos,
        boatName: boats.name,
        boatSlug: boats.slug,
      })
      .from(bragBoardPhotos)
      .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
      .where(where)
      .orderBy(desc(bragBoardPhotos.submittedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(bragBoardPhotos)
      .where(where),
  ]);

  return {
    photos: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  };
}

export async function getBragBoardPhotosByBoat(boatId: number, page = 1, limit = 24) {
  const offset = (page - 1) * limit;
  const where = and(eq(bragBoardPhotos.boatId, boatId), eq(bragBoardPhotos.status, "approved"));

  const results = await db
    .select()
    .from(bragBoardPhotos)
    .where(where)
    .orderBy(desc(bragBoardPhotos.submittedAt))
    .limit(limit)
    .offset(offset);

  return results;
}
