import { db } from "@/lib/db";
import { boats, boatAmenities, boatTripTypes, amenities, tripTypes, operators, membershipTiers } from "@/lib/db/schema";
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
      // Featured: prioritize admin-featured, then featured, then by rating
      orderBy = sql`${boats.isFeaturedAdmin} DESC, ${boats.isFeatured} DESC, ${boats.rating} DESC`;
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
      sql`${boats.isFeaturedAdmin} DESC, ${boats.isFeatured} DESC, ${boats.rating} DESC`
    )
    .limit(limit);
}

export async function getNearbyBoats(boatId: number, lat: string, lng: string, limit = 12) {
  return db
    .select()
    .from(boats)
    .where(
      and(
        eq(boats.isPublished, true),
        sql`${boats.id} != ${boatId}`,
        sql`${boats.latitude} IS NOT NULL`,
        sql`${boats.longitude} IS NOT NULL`
      )
    )
    .orderBy(
      sql`(${boats.latitude}::float - ${parseFloat(lat)})^2 + (${boats.longitude}::float - ${parseFloat(lng)})^2`
    )
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
