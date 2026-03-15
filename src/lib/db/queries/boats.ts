import { db } from "@/lib/db";
import { boats, boatAmenities, boatTripTypes, boatSpecies, amenities, tripTypes, species, speciesCategories, speciesAliases, speciesStateContent, operators, membershipTiers, reviews, bragBoardPhotos, states } from "@/lib/db/schema";
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

  // Trip type filter via join table
  if (tripTypeFilters && tripTypeFilters.length > 0) {
    conditions.push(
      sql`${boats.id} IN (
        SELECT bt.boat_id FROM boat_trip_types bt
        INNER JOIN trip_types tt ON bt.trip_type_id = tt.id
        WHERE tt.slug IN (${sql.join(tripTypeFilters.map(s => sql`${s}`), sql`, `)})
      )`
    );
  }

  // Amenity filter via join table
  if (amenityFilters && amenityFilters.length > 0) {
    const amenityIds = amenityFilters.map(Number).filter((n) => !isNaN(n));
    if (amenityIds.length > 0) {
      conditions.push(
        sql`${boats.id} IN (
          SELECT ba.boat_id FROM boat_amenities ba
          WHERE ba.amenity_id IN (${sql.join(amenityIds.map(id => sql`${id}`), sql`, `)})
          GROUP BY ba.boat_id
          HAVING COUNT(DISTINCT ba.amenity_id) = ${amenityIds.length}
        )`
      );
    }
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

export async function getBoatBySlug(slug: string, options?: { allowUnpublished?: boolean }) {
  const conditions = [eq(boats.slug, slug)];
  if (!options?.allowUnpublished) {
    conditions.push(eq(boats.isPublished, true));
  }

  const [boat] = await db
    .select()
    .from(boats)
    .where(and(...conditions));

  if (!boat) return null;

  // Run all secondary queries in parallel
  const [boatAmenitiesList, boatTripTypesList, boatSpeciesList, operatorResult, stateResult] = await Promise.all([
    // Amenities
    db.select({ amenity: amenities })
      .from(boatAmenities)
      .innerJoin(amenities, eq(boatAmenities.amenityId, amenities.id))
      .where(eq(boatAmenities.boatId, boat.id)),

    // Trip types
    db.select({ tripType: tripTypes })
      .from(boatTripTypes)
      .innerJoin(tripTypes, eq(boatTripTypes.tripTypeId, tripTypes.id))
      .where(eq(boatTripTypes.boatId, boat.id)),

    // Species
    db.select({ species })
      .from(boatSpecies)
      .innerJoin(species, eq(boatSpecies.speciesId, species.id))
      .where(eq(boatSpecies.boatId, boat.id))
      .catch(() => [] as { species: typeof species.$inferSelect }[]),

    // Operator tier
    boat.operatorId
      ? db.select({ operator: operators, tier: membershipTiers })
          .from(operators)
          .leftJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
          .where(eq(operators.id, boat.operatorId))
      : Promise.resolve([]),

    // State slug for breadcrumb links
    boat.stateCode
      ? db.select({ slug: states.slug, name: states.name })
          .from(states)
          .where(eq(states.code, boat.stateCode))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const operatorTier = operatorResult[0]?.tier || null;
  const stateSlug = stateResult[0]?.slug || null;
  const stateName = stateResult[0]?.name || null;

  return {
    ...boat,
    amenities: boatAmenitiesList.map((ba) => ba.amenity),
    tripTypes: boatTripTypesList.map((bt) => bt.tripType),
    species: boatSpeciesList.map((bs) => bs.species),
    operatorTier,
    stateSlug,
    stateName,
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

export async function getNearbyBoatsBySpecies(
  speciesId: number,
  lat: number,
  lng: number,
  stateCode?: string,
  limit = 5
) {
  const distanceSql = sql`3959 * acos(
    cos(radians(${lat})) * cos(radians(${boats.latitude}::float))
    * cos(radians(${boats.longitude}::float) - radians(${lng}))
    + sin(radians(${lat})) * sin(radians(${boats.latitude}::float))
  )`;

  const conditions = [
    eq(boats.isPublished, true),
    sql`${boats.latitude} IS NOT NULL`,
    sql`${boats.longitude} IS NOT NULL`,
    sql`${boats.id} IN (SELECT boat_id FROM boat_species WHERE species_id = ${speciesId})`,
  ];
  if (stateCode) conditions.push(eq(boats.stateCode, stateCode));

  return db
    .select({
      id: boats.id,
      name: boats.name,
      slug: boats.slug,
      operatorName: boats.operatorName,
      operatorId: boats.operatorId,
      cityName: boats.cityName,
      stateCode: boats.stateCode,
      latitude: boats.latitude,
      longitude: boats.longitude,
      primaryImageUrl: boats.primaryImageUrl,
      imageFocalPointX: boats.imageFocalPointX,
      imageFocalPointY: boats.imageFocalPointY,
      rating: boats.rating,
      reviewCount: boats.reviewCount,
      capacity: boats.capacity,
      minPricePerPerson: boats.minPricePerPerson,
      isFeatured: boats.isFeatured,
      isFeaturedAdmin: boats.isFeaturedAdmin,
      distanceMiles: sql<number>`round(${distanceSql}::numeric, 1)`.as("distance_miles"),
    })
    .from(boats)
    .where(and(...conditions))
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

export async function getAllTripTypesWithBoatCounts() {
  return db
    .select({
      id: tripTypes.id,
      name: tripTypes.name,
      slug: tripTypes.slug,
      sortOrder: tripTypes.sortOrder,
      boatCount: sql<number>`count(${boatTripTypes.boatId})`.as("boat_count"),
    })
    .from(tripTypes)
    .leftJoin(
      boatTripTypes,
      eq(boatTripTypes.tripTypeId, tripTypes.id)
    )
    .leftJoin(boats, and(eq(boatTripTypes.boatId, boats.id), eq(boats.isPublished, true)))
    .groupBy(tripTypes.id, tripTypes.name, tripTypes.slug, tripTypes.sortOrder)
    .orderBy(tripTypes.sortOrder);
}

export async function getBoatsByTripType(tripTypeSlug: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const [tt] = await db.select().from(tripTypes).where(eq(tripTypes.slug, tripTypeSlug)).limit(1);
  if (!tt) return null;

  const where = and(
    eq(boats.isPublished, true),
    sql`${boats.id} IN (SELECT boat_id FROM boat_trip_types WHERE trip_type_id = ${tt.id})`
  );

  const [results, countResult] = await Promise.all([
    db.select().from(boats).where(where).orderBy(desc(boats.rating)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(boats).where(where),
  ]);

  return {
    tripType: tt,
    boats: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  };
}

export async function getAllSpeciesWithBoatCounts() {
  try {
    return await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        sortOrder: species.sortOrder,
        scientificName: species.scientificName,
        description: species.description,
        habitat: species.habitat,
        sizeRange: species.sizeRange,
        fightRating: species.fightRating,
        imageUrl: species.imageUrl,
        categoryId: species.categoryId,
        categoryName: speciesCategories.name,
        categorySlug: speciesCategories.slug,
        boatCount: sql<number>`count(DISTINCT CASE WHEN ${boats.isPublished} = true THEN ${boatSpecies.boatId} END)`.as("boat_count"),
      })
      .from(species)
      .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
      .leftJoin(boatSpecies, eq(boatSpecies.speciesId, species.id))
      .leftJoin(boats, eq(boatSpecies.boatId, boats.id))
      .groupBy(species.id, species.name, species.slug, species.sortOrder, species.scientificName, species.description, species.habitat, species.sizeRange, species.fightRating, species.imageUrl, species.categoryId, speciesCategories.name, speciesCategories.slug, speciesCategories.sortOrder)
      .having(sql`count(DISTINCT CASE WHEN ${boats.isPublished} = true THEN ${boatSpecies.boatId} END) > 0`)
      .orderBy(speciesCategories.sortOrder, species.name);
  } catch {
    return [];
  }
}

export async function getPopularSpecies(limit = 8) {
  try {
    const rows = await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        imageUrl: species.imageUrl,
        categoryName: speciesCategories.name,
        boatCount: sql<number>`count(DISTINCT CASE WHEN ${boats.isPublished} = true THEN ${boatSpecies.boatId} END)`.as("boat_count"),
      })
      .from(species)
      .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
      .leftJoin(boatSpecies, eq(boatSpecies.speciesId, species.id))
      .leftJoin(boats, eq(boatSpecies.boatId, boats.id))
      .groupBy(species.id, species.name, species.slug, species.imageUrl, speciesCategories.name)
      .having(sql`count(DISTINCT CASE WHEN ${boats.isPublished} = true THEN ${boatSpecies.boatId} END) > 0`)
      .orderBy(sql`boat_count DESC`)
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

export async function getAllSpeciesCategories() {
  try {
    return await db
      .select()
      .from(speciesCategories)
      .orderBy(speciesCategories.sortOrder);
  } catch {
    return [];
  }
}

export async function getSpeciesWithAliases(speciesId: number) {
  const aliases = await db
    .select({ id: speciesAliases.id, name: speciesAliases.name })
    .from(speciesAliases)
    .where(eq(speciesAliases.speciesId, speciesId));
  return aliases;
}

export async function searchSpeciesByName(query: string) {
  const q = `%${query.toLowerCase()}%`;
  try {
    return await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        scientificName: species.scientificName,
        categoryName: speciesCategories.name,
      })
      .from(species)
      .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
      .where(
        sql`(
          LOWER(${species.name}) LIKE ${q}
          OR LOWER(${species.scientificName}) LIKE ${q}
          OR ${species.id} IN (
            SELECT ${speciesAliases.speciesId} FROM ${speciesAliases}
            WHERE ${speciesAliases.nameLower} LIKE ${q}
          )
        )`
      )
      .orderBy(species.name)
      .limit(50);
  } catch {
    return [];
  }
}

export async function getBoatsBySpecies(speciesSlug: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  try {
    const [sp] = await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        scientificName: species.scientificName,
        description: species.description,
        descriptionLong: species.descriptionLong,
        seasonInfo: species.seasonInfo,
        sizeRange: species.sizeRange,
        habitat: species.habitat,
        fightRating: species.fightRating,
        edibility: species.edibility,
        imageUrl: species.imageUrl,
        categoryId: species.categoryId,
        categoryName: speciesCategories.name,
        categorySlug: speciesCategories.slug,
      })
      .from(species)
      .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
      .where(eq(species.slug, speciesSlug))
      .limit(1);
    if (!sp) return null;

    // Get aliases
    const aliases = await db
      .select({ name: speciesAliases.name })
      .from(speciesAliases)
      .where(eq(speciesAliases.speciesId, sp.id));

    const where = and(
      eq(boats.isPublished, true),
      sql`${boats.id} IN (SELECT boat_id FROM boat_species WHERE species_id = ${sp.id})`
    );

    const [results, countResult] = await Promise.all([
      db.select().from(boats).where(where).orderBy(desc(boats.rating)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(boats).where(where),
    ]);

    return {
      species: sp,
      aliases: aliases.map((a) => a.name),
      boats: results,
      total: Number(countResult[0]?.count ?? 0),
      page,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  } catch {
    return null;
  }
}

export async function getBoatsBySpeciesAndState(speciesSlug: string, stateSlug: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  try {
    // Get species info
    const [sp] = await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        scientificName: species.scientificName,
        description: species.description,
        imageUrl: species.imageUrl,
        categoryId: species.categoryId,
        categoryName: speciesCategories.name,
        categorySlug: speciesCategories.slug,
      })
      .from(species)
      .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
      .where(eq(species.slug, speciesSlug))
      .limit(1);
    if (!sp) return null;

    // Get state info
    const [st] = await db.select().from(states).where(eq(states.slug, stateSlug)).limit(1);
    if (!st) return null;

    // Get aliases and state-specific content
    const [aliases, stateContentResult] = await Promise.all([
      db.select({ name: speciesAliases.name }).from(speciesAliases).where(eq(speciesAliases.speciesId, sp.id)),
      db.select().from(speciesStateContent).where(and(eq(speciesStateContent.speciesId, sp.id), eq(speciesStateContent.stateCode, st.code))).limit(1),
    ]);

    // Get boats matching both species and state
    const where = and(
      eq(boats.isPublished, true),
      eq(boats.stateCode, st.code),
      sql`${boats.id} IN (SELECT boat_id FROM boat_species WHERE species_id = ${sp.id})`
    );

    const [results, countResult] = await Promise.all([
      db.select().from(boats).where(where).orderBy(desc(boats.rating)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(boats).where(where),
    ]);

    // Get other states where this species has boats (for cross-linking)
    const otherStates = await db
      .selectDistinct({
        stateName: states.name,
        stateSlug: states.slug,
        stateCode: states.code,
      })
      .from(boatSpecies)
      .innerJoin(boats, and(eq(boatSpecies.boatId, boats.id), eq(boats.isPublished, true)))
      .innerJoin(states, eq(boats.stateCode, states.code))
      .where(and(eq(boatSpecies.speciesId, sp.id), sql`${states.code} != ${st.code}`))
      .orderBy(states.name);

    return {
      species: sp,
      state: st,
      stateContent: stateContentResult[0] || null,
      aliases: aliases.map((a) => a.name),
      boats: results,
      total: Number(countResult[0]?.count ?? 0),
      page,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      otherStates,
    };
  } catch {
    return null;
  }
}

export async function getAllSpeciesStateCombinations() {
  try {
    return await db
      .selectDistinct({
        speciesSlug: species.slug,
        stateSlug: states.slug,
      })
      .from(boatSpecies)
      .innerJoin(boats, and(eq(boatSpecies.boatId, boats.id), eq(boats.isPublished, true)))
      .innerJoin(species, eq(boatSpecies.speciesId, species.id))
      .innerJoin(states, eq(boats.stateCode, states.code));
  } catch {
    return [];
  }
}

export async function getStatesForSpecies(speciesSlug: string) {
  try {
    const [sp] = await db.select({ id: species.id }).from(species).where(eq(species.slug, speciesSlug)).limit(1);
    if (!sp) return [];

    return await db
      .select({
        stateName: states.name,
        stateSlug: states.slug,
        stateCode: states.code,
        boatCount: sql<number>`count(DISTINCT ${boats.id})`.as("boat_count"),
      })
      .from(boatSpecies)
      .innerJoin(boats, and(eq(boatSpecies.boatId, boats.id), eq(boats.isPublished, true)))
      .innerJoin(states, eq(boats.stateCode, states.code))
      .where(eq(boatSpecies.speciesId, sp.id))
      .groupBy(states.name, states.slug, states.code)
      .orderBy(states.name);
  } catch {
    return [];
  }
}

export async function getSpeciesByCategory(categorySlug: string) {
  try {
    const [cat] = await db
      .select()
      .from(speciesCategories)
      .where(eq(speciesCategories.slug, categorySlug))
      .limit(1);
    if (!cat) return null;

    const speciesList = await db
      .select({
        id: species.id,
        name: species.name,
        slug: species.slug,
        scientificName: species.scientificName,
        description: species.description,
        imageUrl: species.imageUrl,
        boatCount: sql<number>`count(DISTINCT CASE WHEN ${boats.isPublished} = true THEN ${boatSpecies.boatId} END)`.as("boat_count"),
      })
      .from(species)
      .leftJoin(boatSpecies, eq(boatSpecies.speciesId, species.id))
      .leftJoin(boats, eq(boatSpecies.boatId, boats.id))
      .where(eq(species.categoryId, cat.id))
      .groupBy(species.id, species.name, species.slug, species.scientificName, species.description, species.imageUrl)
      .orderBy(species.name);

    return { category: cat, species: speciesList };
  } catch {
    return null;
  }
}
