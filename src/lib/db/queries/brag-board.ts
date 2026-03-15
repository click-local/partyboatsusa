import { db } from "@/lib/db";
import { bragBoardPhotos, bragBoardPhotoSpecies, boats, species } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface BragBoardFilters {
  stateCode?: string;
  speciesId?: number;
}

export async function getBragBoardPhotos(page = 1, limit = 24, filters?: BragBoardFilters) {
  const offset = (page - 1) * limit;

  const conditions = [eq(bragBoardPhotos.status, "approved")];
  if (filters?.stateCode) {
    conditions.push(eq(boats.stateCode, filters.stateCode));
  }

  // When filtering by species, we need to join the junction table
  const needsSpeciesJoin = !!filters?.speciesId;

  // Build the base query for results
  let resultsQuery = db
    .select({
      photo: bragBoardPhotos,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id));

  let countQuery = db
    .select({ count: sql<number>`count(distinct ${bragBoardPhotos.id})` })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id));

  if (needsSpeciesJoin) {
    resultsQuery = resultsQuery.innerJoin(
      bragBoardPhotoSpecies,
      eq(bragBoardPhotos.id, bragBoardPhotoSpecies.photoId)
    ) as typeof resultsQuery;
    countQuery = countQuery.innerJoin(
      bragBoardPhotoSpecies,
      eq(bragBoardPhotos.id, bragBoardPhotoSpecies.photoId)
    ) as typeof countQuery;
    conditions.push(eq(bragBoardPhotoSpecies.speciesId, filters!.speciesId!));
  }

  const where = and(...conditions);

  const [results, countResult] = await Promise.all([
    resultsQuery
      .where(where)
      .orderBy(desc(bragBoardPhotos.submittedAt))
      .limit(limit)
      .offset(offset),
    countQuery.where(where),
  ]);

  // Fetch species names for all photos in this page
  const photoIds = results.map((r) => r.photo.id);
  const speciesMap = await getSpeciesMapForPhotos(photoIds);

  return {
    photos: results.map((r) => ({
      ...r,
      speciesNames: speciesMap.get(r.photo.id) || [],
    })),
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

export async function getBragBoardPhotosBySpecies(speciesId: number, limit = 8) {
  const results = await db
    .select({
      photo: bragBoardPhotos,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
    .from(bragBoardPhotoSpecies)
    .innerJoin(bragBoardPhotos, eq(bragBoardPhotoSpecies.photoId, bragBoardPhotos.id))
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
    .where(
      and(
        eq(bragBoardPhotoSpecies.speciesId, speciesId),
        eq(bragBoardPhotos.status, "approved")
      )
    )
    .orderBy(desc(bragBoardPhotos.submittedAt))
    .limit(limit);

  return results;
}

/** Helper: fetch species names grouped by photo ID */
async function getSpeciesMapForPhotos(photoIds: number[]) {
  const map = new Map<number, string[]>();
  if (photoIds.length === 0) return map;

  const rows = await db
    .select({
      photoId: bragBoardPhotoSpecies.photoId,
      speciesName: species.name,
    })
    .from(bragBoardPhotoSpecies)
    .innerJoin(species, eq(bragBoardPhotoSpecies.speciesId, species.id))
    .where(inArray(bragBoardPhotoSpecies.photoId, photoIds));

  for (const row of rows) {
    const existing = map.get(row.photoId) || [];
    existing.push(row.speciesName);
    map.set(row.photoId, existing);
  }

  return map;
}
