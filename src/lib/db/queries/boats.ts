import { db } from "@/lib/db";
import { boats, boatAmenities, boatTripTypes, amenities, tripTypes, operators, membershipTiers, reviews, bragBoardPhotos } from "@/lib/db/schema";
import { eq, and, ilike, sql, desc, asc, inArray, gte, lte, or } from "drizzle-orm";

export interface SearchFilters {
  query?: string;
  states?: string[];
  city?: string;
  tripTypes?: string[];
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function searchBoats(filters: SearchFilters) {
  const {
    query,
    states: stateFilters,
    city,
    tripTypes: tripTypeFilters,
    amenities: amenityFilters,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
    minRating,
    sort = "featured",
    page = 1,
    limit = 18,
  } = filters;

  const conditions = [eq(boats.isPublished, true)];

  if (query) {
    conditions.push(
      or(
        ilike(boats.name, `%${query}%`),
        ilike(boats.operatorName, `%${query}%`),
        ilike(boats.cityName, `%${query}%`),
        ilike(boats.descriptionShort, `%${query}%`)
      )!
    );
  }

  if (stateFilters && stateFilters.length > 0) {
    conditions.push(inArray(boats.stateCode, stateFilters));
  }

  if (city) {
    conditions.push(ilike(boats.cityName, city));
  }

  if (minPrice !== undefined) {
    conditions.push(gte(boats.minPricePerPerson, String(minPrice)));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(boats.maxPricePerPerson, String(maxPrice)));
  }

  if (minCapacity !== undefined) {
    conditions.push(gte(boats.capacity, minCapacity));
  }

  if (maxCapacity !== undefined) {
    conditions.push(lte(boats.capacity, maxCapacity));
  }

  if (minRating !== undefined) {
    conditions.push(gte(boats.rating, String(minRating)));
  }

  const offset = (page - 1) * limit;

  // Determine sort order
  let orderBy;
  switch (sort) {
    case "price-low":
      orderBy = asc(boats.minPricePerPerson);
      break;
    case "price-high":
      orderBy = desc(boats.maxPricePerPerson);
      break;
    case "rating":
      orderBy = desc(boats.rating);
      break;
    case "name":
      orderBy = asc(boats.name);
      break;
    case "capacity":
      orderBy = desc(boats.capacity);
      break;
    default:
      // Admin-featured first, then ranked by 4+ star reviews + approved brag board photos, then rating
      orderBy = sql`${boats.isFeaturedAdmin} DESC,
        (SELECT count(*) FROM ${reviews} WHERE ${reviews.boatId} = ${boats.id} AND ${reviews.status} = 'approved' AND ${reviews.rating} >= 4)
        + (SELECT count(*) FROM ${bragBoardPhotos} WHERE ${bragBoardPhotos.boatId} = ${boats.id} AND ${bragBoardPhotos.status} = 'approved')
        DESC, ${boats.rating} DESC`;
  }

  const where = and(...conditions);

  const [results, countResult] = await Promise.all([
    db
      .select()
      .from(boats)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(boats)
      .where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    boats: results,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBoatBySlug(slug: string) {
  const [boat] = await db
    .select()
    .from(boats)
    .where(eq(boats.slug, slug));

  if (!boat) return null;

  // Get amenities
  const boatAmenitiesList = await db
    .select({ amenity: amenities })
    .from(boatAmenities)
    .innerJoin(amenities, eq(boatAmenities.amenityId, amenities.id))
    .where(eq(boatAmenities.boatId, boat.id));

  // Get trip types
  const boatTripTypesList = await db
    .select({ tripType: tripTypes })
    .from(boatTripTypes)
    .innerJoin(tripTypes, eq(boatTripTypes.tripTypeId, tripTypes.id))
    .where(eq(boatTripTypes.boatId, boat.id));

  // Get operator tier info if operator exists
  let operatorTier = null;
  if (boat.operatorId) {
    const [op] = await db
      .select({
        operator: operators,
        tier: membershipTiers,
      })
      .from(operators)
      .leftJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
      .where(eq(operators.id, boat.operatorId));

    if (op?.tier) {
      operatorTier = op.tier;
    }
  }

  return {
    ...boat,
    amenities: boatAmenitiesList.map((ba) => ba.amenity),
    tripTypes: boatTripTypesList.map((bt) => bt.tripType),
    operatorTier,
  };
}

export async function getFeaturedBoats(limit = 9) {
  return db
    .select()
    .from(boats)
    .where(eq(boats.isPublished, true))
    .orderBy(
      sql`${boats.isFeaturedAdmin} DESC,
        (SELECT count(*) FROM ${reviews} WHERE ${reviews.boatId} = ${boats.id} AND ${reviews.status} = 'approved' AND ${reviews.rating} >= 4)
        + (SELECT count(*) FROM ${bragBoardPhotos} WHERE ${bragBoardPhotos.boatId} = ${boats.id} AND ${bragBoardPhotos.status} = 'approved')
        DESC, ${boats.rating} DESC`
    )
    .limit(limit);
}

export async function getNearbyBoats(boatId: number, lat: string, lng: string, limit = 12) {
  // Haversine distance in miles, capped at 100 miles
  const latF = parseFloat(lat);
  const lngF = parseFloat(lng);
  const distanceSql = sql`3959 * acos(
    cos(radians(${latF})) * cos(radians(${boats.latitude}::float))
    * cos(radians(${boats.longitude}::float) - radians(${lngF}))
    + sin(radians(${latF})) * sin(radians(${boats.latitude}::float))
  )`;

  return db
    .select()
    .from(boats)
    .where(
      and(
        eq(boats.isPublished, true),
        sql`${boats.id} != ${boatId}`,
        sql`${boats.latitude} IS NOT NULL`,
        sql`${boats.longitude} IS NOT NULL`,
        sql`${distanceSql} <= 100`
      )
    )
    .orderBy(distanceSql)
    .limit(limit);
}

export async function getFleetBoats(operatorId: number, excludeBoatId: number) {
  return db
    .select()
    .from(boats)
    .where(
      and(
        eq(boats.isPublished, true),
        eq(boats.operatorId, operatorId),
        sql`${boats.id} != ${excludeBoatId}`
      )
    );
}

export async function getBoatsByState(stateCode: string, page = 1, limit = 18) {
  const offset = (page - 1) * limit;
  const where = and(eq(boats.isPublished, true), eq(boats.stateCode, stateCode));

  const [results, countResult] = await Promise.all([
    db.select().from(boats).where(where).orderBy(desc(boats.rating)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(boats).where(where),
  ]);

  return {
    boats: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  };
}

export async function getTierBadgesForBoats(operatorIds: (number | null)[]) {
  const validIds = [...new Set(operatorIds.filter((id): id is number => id !== null))];
  if (validIds.length === 0) return new Map<number, { name: string; color: string }>();

  const results = await db
    .select({
      operatorId: operators.id,
      tierName: membershipTiers.name,
      badgeColor: membershipTiers.badgeColor,
    })
    .from(operators)
    .innerJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
    .where(and(inArray(operators.id, validIds), eq(membershipTiers.displayBadge, true)));

  return new Map(results.map((r) => [r.operatorId, { name: r.tierName, color: r.badgeColor || "#3B82F6" }]));
}

export async function getBoatCountsByState() {
  return db
    .select({
      stateCode: boats.stateCode,
      count: sql<number>`count(*)`,
    })
    .from(boats)
    .where(eq(boats.isPublished, true))
    .groupBy(boats.stateCode);
}
