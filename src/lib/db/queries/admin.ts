import { db } from "@/lib/db";
import {
  boats, operators, membershipTiers, boatAmenities, boatTripTypes, boatSpecies,
  amenities, tripTypes, species, speciesCategories, speciesAliases, speciesSuggestions,
  states, cities, reviews, bragBoardPhotos, bragBoardPhotoSpecies,
  boatSubmissions, claimRequests, destinationPages, contentBlocks,
  siteSettings, emailTemplates, featureComparisonItems, featureTierValues,
  operatorContactLogs, pageSeoSettings,
} from "@/lib/db/schema";
import { eq, desc, asc, sql, and, isNull, inArray } from "drizzle-orm";

// ===== BOATS =====
export async function adminGetBoats() {
  return db.select().from(boats).orderBy(desc(boats.id));
}

export async function adminGetBoatById(id: number) {
  const result = await db.select().from(boats).where(eq(boats.id, id)).limit(1);
  return result[0] ?? null;
}

export async function adminCreateBoat(data: Record<string, unknown>, tripTypeIds?: number[], amenityIds?: number[], speciesIds?: number[]) {
  const [boat] = await db.insert(boats).values(data as never).returning();
  if (tripTypeIds?.length) {
    await db.insert(boatTripTypes).values(tripTypeIds.map((tid) => ({ boatId: boat.id, tripTypeId: tid })));
  }
  if (amenityIds?.length) {
    await db.insert(boatAmenities).values(amenityIds.map((aid) => ({ boatId: boat.id, amenityId: aid })));
  }
  if (speciesIds?.length) {
    await db.insert(boatSpecies).values(speciesIds.map((sid) => ({ boatId: boat.id, speciesId: sid })));
  }
  return boat;
}

export async function adminUpdateBoat(id: number, data: Record<string, unknown>, tripTypeIds?: number[], amenityIds?: number[], speciesIds?: number[]) {
  const [boat] = await db.update(boats).set(data as never).where(eq(boats.id, id)).returning();
  if (tripTypeIds !== undefined) {
    await db.delete(boatTripTypes).where(eq(boatTripTypes.boatId, id));
    if (tripTypeIds.length) {
      await db.insert(boatTripTypes).values(tripTypeIds.map((tid) => ({ boatId: id, tripTypeId: tid })));
    }
  }
  if (amenityIds !== undefined) {
    await db.delete(boatAmenities).where(eq(boatAmenities.boatId, id));
    if (amenityIds.length) {
      await db.insert(boatAmenities).values(amenityIds.map((aid) => ({ boatId: id, amenityId: aid })));
    }
  }
  if (speciesIds !== undefined) {
    await db.delete(boatSpecies).where(eq(boatSpecies.boatId, id));
    if (speciesIds.length) {
      await db.insert(boatSpecies).values(speciesIds.map((sid) => ({ boatId: id, speciesId: sid })));
    }
  }
  return boat;
}

export async function adminDeleteBoat(id: number) {
  await db.delete(boats).where(eq(boats.id, id));
}

// ===== REVIEWS =====
export async function adminGetReviews() {
  return db.select({ review: reviews, boatName: boats.name })
    .from(reviews).innerJoin(boats, eq(reviews.boatId, boats.id))
    .orderBy(desc(reviews.createdAt));
}

export async function adminUpdateReview(id: number, data: Record<string, unknown>) {
  const [r] = await db.update(reviews).set(data as never).where(eq(reviews.id, id)).returning();
  return r;
}

export async function syncBoatRatingFromReviews(boatId: number) {
  const [stats] = await db
    .select({
      avg: sql<string>`COALESCE(ROUND(AVG(${reviews.rating})::numeric, 1), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(and(eq(reviews.boatId, boatId), eq(reviews.status, "approved")));

  await db
    .update(boats)
    .set({
      rating: stats?.avg ?? "0",
      reviewCount: stats?.count ?? 0,
    })
    .where(eq(boats.id, boatId));
}

export async function adminDeleteReview(id: number) {
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ===== SUBMISSIONS =====
export async function adminGetSubmissions() {
  return db.select().from(boatSubmissions).orderBy(desc(boatSubmissions.createdAt));
}

export async function adminUpdateSubmission(id: number, data: Record<string, unknown>) {
  const [s] = await db.update(boatSubmissions).set(data as never).where(eq(boatSubmissions.id, id)).returning();
  return s;
}

// ===== OPERATORS =====
export async function adminGetOperators() {
  return db.select({
    operator: operators,
    tierName: membershipTiers.name,
    tierBadgeColor: membershipTiers.badgeColor,
  }).from(operators)
    .leftJoin(membershipTiers, eq(operators.membershipTierId, membershipTiers.id))
    .orderBy(desc(operators.id));
}

export async function adminAssignOperatorTier(operatorId: number, tierId: number | null) {
  const [op] = await db.update(operators)
    .set({ membershipTierId: tierId })
    .where(eq(operators.id, operatorId))
    .returning();
  return op;
}

export async function adminDeleteOperator(id: number) {
  await db.delete(operators).where(eq(operators.id, id));
}

// ===== CRM =====
export async function adminGetContactLogs(limit = 100) {
  return db.select({
    log: operatorContactLogs,
    operatorEmail: operators.email,
    companyName: operators.companyName,
  }).from(operatorContactLogs)
    .leftJoin(operators, eq(operatorContactLogs.operatorId, operators.id))
    .orderBy(desc(operatorContactLogs.createdAt))
    .limit(limit);
}

export async function adminDeleteContactLog(id: number) {
  await db.delete(operatorContactLogs).where(eq(operatorContactLogs.id, id));
}

// ===== MEMBERSHIP TIERS =====
export async function adminGetMembershipTiers() {
  return db.select().from(membershipTiers).orderBy(asc(membershipTiers.sortOrder));
}

export async function adminGetMembershipTierById(id: number) {
  const result = await db.select().from(membershipTiers).where(eq(membershipTiers.id, id)).limit(1);
  return result[0] ?? null;
}

export async function adminCreateMembershipTier(data: Record<string, unknown>) {
  const [tier] = await db.insert(membershipTiers).values(data as never).returning();
  return tier;
}

export async function adminUpdateMembershipTier(id: number, data: Record<string, unknown>) {
  const [tier] = await db.update(membershipTiers).set(data as never).where(eq(membershipTiers.id, id)).returning();
  return tier;
}

export async function adminDeleteMembershipTier(id: number) {
  await db.delete(membershipTiers).where(eq(membershipTiers.id, id));
}

// ===== TRIP TYPES =====
export async function adminGetTripTypes() {
  return db.select().from(tripTypes).orderBy(asc(tripTypes.sortOrder));
}

export async function adminCreateTripType(data: { name: string; slug: string; sortOrder?: number }) {
  const [tt] = await db.insert(tripTypes).values(data).returning();
  return tt;
}

export async function adminUpdateTripType(id: number, data: Record<string, unknown>) {
  const [tt] = await db.update(tripTypes).set(data as never).where(eq(tripTypes.id, id)).returning();
  return tt;
}

export async function adminDeleteTripType(id: number) {
  await db.delete(tripTypes).where(eq(tripTypes.id, id));
}

// ===== SPECIES =====
export async function adminGetSpecies() {
  return db
    .select({
      id: species.id,
      name: species.name,
      slug: species.slug,
      sortOrder: species.sortOrder,
      scientificName: species.scientificName,
      description: species.description,
      imageUrl: species.imageUrl,
      categoryId: species.categoryId,
      categoryName: speciesCategories.name,
    })
    .from(species)
    .leftJoin(speciesCategories, eq(species.categoryId, speciesCategories.id))
    .orderBy(speciesCategories.sortOrder, asc(species.name));
}

export async function adminCreateSpecies(data: Record<string, unknown>) {
  const [s] = await db.insert(species).values(data as never).returning();
  return s;
}

export async function adminUpdateSpecies(id: number, data: Record<string, unknown>) {
  const [s] = await db.update(species).set(data as never).where(eq(species.id, id)).returning();
  return s;
}

export async function adminDeleteSpecies(id: number) {
  await db.delete(species).where(eq(species.id, id));
}

export async function adminGetSpeciesAliases(speciesId: number) {
  return db.select().from(speciesAliases).where(eq(speciesAliases.speciesId, speciesId));
}

export async function adminSetSpeciesAliases(speciesId: number, aliases: string[]) {
  await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, speciesId));
  if (aliases.length > 0) {
    await db.insert(speciesAliases).values(
      aliases.map((name) => ({ speciesId, name, nameLower: name.toLowerCase() }))
    );
  }
}

// ===== SPECIES CATEGORIES =====
export async function adminGetSpeciesCategories() {
  return db.select().from(speciesCategories).orderBy(asc(speciesCategories.sortOrder));
}

export async function adminCreateSpeciesCategory(data: Record<string, unknown>) {
  const [c] = await db.insert(speciesCategories).values(data as never).returning();
  return c;
}

export async function adminUpdateSpeciesCategory(id: number, data: Record<string, unknown>) {
  const [c] = await db.update(speciesCategories).set(data as never).where(eq(speciesCategories.id, id)).returning();
  return c;
}

export async function adminDeleteSpeciesCategory(id: number) {
  await db.delete(speciesCategories).where(eq(speciesCategories.id, id));
}

// ===== SPECIES SUGGESTIONS =====
export async function adminGetSpeciesSuggestions() {
  return db
    .select({
      id: speciesSuggestions.id,
      speciesName: speciesSuggestions.speciesName,
      commonNames: speciesSuggestions.commonNames,
      notes: speciesSuggestions.notes,
      status: speciesSuggestions.status,
      createdAt: speciesSuggestions.createdAt,
      operatorId: speciesSuggestions.operatorId,
      operatorCompany: operators.companyName,
      operatorEmail: operators.email,
    })
    .from(speciesSuggestions)
    .innerJoin(operators, eq(speciesSuggestions.operatorId, operators.id))
    .orderBy(desc(speciesSuggestions.createdAt));
}

export async function adminUpdateSpeciesSuggestion(id: number, status: string) {
  const [s] = await db
    .update(speciesSuggestions)
    .set({ status })
    .where(eq(speciesSuggestions.id, id))
    .returning();
  return s;
}

// ===== AMENITIES =====
export async function adminGetAmenities() {
  return db.select().from(amenities).orderBy(asc(amenities.sortOrder));
}

export async function adminCreateAmenity(data: { name: string; slug: string; icon: string; sortOrder?: number }) {
  const [a] = await db.insert(amenities).values(data).returning();
  return a;
}

export async function adminUpdateAmenity(id: number, data: Record<string, unknown>) {
  const [a] = await db.update(amenities).set(data as never).where(eq(amenities.id, id)).returning();
  return a;
}

export async function adminDeleteAmenity(id: number) {
  await db.delete(amenities).where(eq(amenities.id, id));
}

// ===== DESTINATION PAGES =====
export async function adminGetDestinationPages() {
  return db.select().from(destinationPages).orderBy(desc(destinationPages.id));
}

export async function adminGetDestinationPageById(id: number) {
  const result = await db.select().from(destinationPages).where(eq(destinationPages.id, id)).limit(1);
  return result[0] ?? null;
}

export async function adminCreateDestinationPage(data: Record<string, unknown>) {
  const [page] = await db.insert(destinationPages).values(data as never).returning();
  return page;
}

export async function adminUpdateDestinationPage(id: number, data: Record<string, unknown>) {
  const [page] = await db.update(destinationPages).set({ ...data, updatedAt: new Date() } as never).where(eq(destinationPages.id, id)).returning();
  return page;
}

export async function adminDeleteDestinationPage(id: number) {
  await db.delete(destinationPages).where(eq(destinationPages.id, id));
}

// ===== CONTENT BLOCKS =====
export async function adminGetContentBlocks(pageId: number) {
  return db.select().from(contentBlocks)
    .where(eq(contentBlocks.destinationPageId, pageId))
    .orderBy(asc(contentBlocks.blockOrder));
}

export async function adminCreateContentBlock(data: Record<string, unknown>) {
  const [block] = await db.insert(contentBlocks).values(data as never).returning();
  return block;
}

export async function adminUpdateContentBlock(id: number, data: Record<string, unknown>) {
  const [block] = await db.update(contentBlocks).set(data as never).where(eq(contentBlocks.id, id)).returning();
  return block;
}

export async function adminDeleteContentBlock(id: number) {
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
}

// ===== SITE SETTINGS =====
export async function adminGetSiteSettings() {
  const result = await db.select().from(siteSettings).limit(1);
  return result[0] ?? null;
}

export async function adminUpdateSiteSettings(data: Record<string, unknown>) {
  const existing = await adminGetSiteSettings();
  if (existing) {
    const [s] = await db.update(siteSettings).set(data as never).where(eq(siteSettings.id, existing.id)).returning();
    return s;
  }
  const [s] = await db.insert(siteSettings).values(data as never).returning();
  return s;
}

// ===== PAGE SEO =====
export async function adminGetPageSeoSettings() {
  return db.select().from(pageSeoSettings).orderBy(asc(pageSeoSettings.pageKey));
}

export async function adminUpsertPageSeo(pageKey: string, data: Record<string, unknown>) {
  const existing = await db.select().from(pageSeoSettings).where(eq(pageSeoSettings.pageKey, pageKey)).limit(1);
  if (existing.length > 0) {
    const [s] = await db.update(pageSeoSettings).set(data as never).where(eq(pageSeoSettings.pageKey, pageKey)).returning();
    return s;
  }
  const [s] = await db.insert(pageSeoSettings).values({ pageKey, ...data } as never).returning();
  return s;
}

// ===== EMAIL TEMPLATES =====
export async function adminGetEmailTemplates() {
  return db.select().from(emailTemplates).orderBy(asc(emailTemplates.name));
}

export async function adminGetEmailTemplateById(id: number) {
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return result[0] ?? null;
}

export async function adminCreateEmailTemplate(data: Record<string, unknown>) {
  const [t] = await db.insert(emailTemplates).values(data as never).returning();
  return t;
}

export async function adminUpdateEmailTemplate(id: number, data: Record<string, unknown>) {
  const [t] = await db.update(emailTemplates).set(data as never).where(eq(emailTemplates.id, id)).returning();
  return t;
}

export async function adminDeleteEmailTemplate(id: number) {
  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}

// ===== FEATURE COMPARISON =====
export async function adminGetFeatureComparison() {
  const features = await db.select().from(featureComparisonItems).orderBy(asc(featureComparisonItems.sortOrder));
  const values = await db.select().from(featureTierValues);
  const tiers = await db.select().from(membershipTiers).orderBy(asc(membershipTiers.sortOrder));
  return { features, values, tiers };
}

export async function adminCreateFeatureItem(data: Record<string, unknown>, tierValues?: { tierId: number; included: boolean; customValue?: string }[]) {
  const [item] = await db.insert(featureComparisonItems).values(data as never).returning();
  if (tierValues?.length) {
    await db.insert(featureTierValues).values(tierValues.map((tv) => ({ featureId: item.id, ...tv })));
  }
  return item;
}

export async function adminUpdateFeatureItem(id: number, data: Record<string, unknown>, tierValues?: { tierId: number; included: boolean; customValue?: string }[]) {
  const [item] = await db.update(featureComparisonItems).set(data as never).where(eq(featureComparisonItems.id, id)).returning();
  if (tierValues !== undefined) {
    await db.delete(featureTierValues).where(eq(featureTierValues.featureId, id));
    if (tierValues.length) {
      await db.insert(featureTierValues).values(tierValues.map((tv) => ({ featureId: id, ...tv })));
    }
  }
  return item;
}

export async function adminDeleteFeatureItem(id: number) {
  await db.delete(featureComparisonItems).where(eq(featureComparisonItems.id, id));
}

// ===== STATES & CITIES =====
export async function adminGetStates() {
  return db.select().from(states).orderBy(asc(states.name));
}

export async function adminGetCities() {
  return db.select().from(cities).orderBy(asc(cities.name));
}

export async function adminGetBragBoardCounts() {
  const [totalResult, pendingResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(bragBoardPhotos),
    db.select({ count: sql<number>`count(*)` }).from(bragBoardPhotos).where(eq(bragBoardPhotos.status, "pending")),
  ]);
  return {
    total: Number(totalResult[0]?.count ?? 0),
    pending: Number(pendingResult[0]?.count ?? 0),
  };
}

export async function adminSyncCitiesFromBoats() {
  // Get distinct city/state combos from published boats
  const boatCities = await db
    .selectDistinct({ cityName: boats.cityName, stateCode: boats.stateCode })
    .from(boats)
    .where(eq(boats.isPublished, true));

  // Get existing cities
  const existingCities = await db.select({ id: cities.id, name: cities.name, stateCode: cities.stateCode }).from(cities);
  const existingSet = new Set(existingCities.map((c) => `${c.name.toLowerCase()}|${c.stateCode}`));

  // Find missing cities
  const missing = boatCities.filter(
    (bc) => bc.cityName && !existingSet.has(`${bc.cityName.toLowerCase()}|${bc.stateCode}`)
  );

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

  let citiesAdded = 0;
  if (missing.length > 0) {
    const newCities = missing.map((m) => ({
      name: m.cityName,
      slug: slugify(m.cityName),
      stateCode: m.stateCode,
    }));
    await db.insert(cities).values(newCities);
    citiesAdded = newCities.length;
  }

  // Auto-create destination pages for states/cities with boats but no dest page
  const [existingPages, allStates, allCities] = await Promise.all([
    db.select({ type: destinationPages.type, referenceId: destinationPages.referenceId }).from(destinationPages),
    db.select({ id: states.id, code: states.code }).from(states),
    db.select({ id: cities.id, name: cities.name, stateCode: cities.stateCode }).from(cities),
  ]);

  const pageSet = new Set(existingPages.map((p) => `${p.type}|${p.referenceId}`));

  // States with published boats that lack a destination page
  const boatStateCodes = new Set(boatCities.map((bc) => bc.stateCode));
  const missingStatePages = allStates
    .filter((s) => boatStateCodes.has(s.code) && !pageSet.has(`state|${s.id}`))
    .map((s) => ({ type: "state" as const, referenceId: s.id, isPublished: false }));

  // Cities with published boats that lack a destination page
  const cityLookup = new Map(allCities.map((c) => [`${c.name.toLowerCase()}|${c.stateCode}`, c.id]));
  const missingCityPages: { type: "city"; referenceId: number; isPublished: false }[] = [];
  for (const bc of boatCities) {
    if (!bc.cityName) continue;
    const cityId = cityLookup.get(`${bc.cityName.toLowerCase()}|${bc.stateCode}`);
    if (cityId && !pageSet.has(`city|${cityId}`)) {
      missingCityPages.push({ type: "city", referenceId: cityId, isPublished: false });
    }
  }

  const newPages = [...missingStatePages, ...missingCityPages];
  let pagesAdded = 0;
  if (newPages.length > 0) {
    await db.insert(destinationPages).values(newPages as never[]);
    pagesAdded = newPages.length;
  }

  return {
    citiesAdded,
    pagesAdded,
    totalCities: existingCities.length + citiesAdded,
    totalPages: existingPages.length + pagesAdded,
  };
}

// ===== CLAIM REQUESTS =====

export async function adminGetClaimRequests() {
  return db
    .select({
      id: claimRequests.id,
      status: claimRequests.status,
      message: claimRequests.message,
      createdAt: claimRequests.createdAt,
      boatId: claimRequests.boatId,
      boatName: boats.name,
      boatCity: boats.cityName,
      boatState: boats.stateCode,
      operatorId: claimRequests.operatorId,
      operatorCompany: operators.companyName,
      operatorEmail: operators.email,
    })
    .from(claimRequests)
    .innerJoin(boats, eq(claimRequests.boatId, boats.id))
    .innerJoin(operators, eq(claimRequests.operatorId, operators.id))
    .orderBy(desc(claimRequests.createdAt));
}

export async function adminApproveClaim(claimId: number) {
  const [claim] = await db
    .select()
    .from(claimRequests)
    .where(eq(claimRequests.id, claimId))
    .limit(1);

  if (!claim) return null;

  // Assign the boat to the operator
  await db
    .update(boats)
    .set({ operatorId: claim.operatorId })
    .where(and(eq(boats.id, claim.boatId), isNull(boats.operatorId)));

  // Update claim status
  const [updated] = await db
    .update(claimRequests)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(claimRequests.id, claimId))
    .returning();

  return updated;
}

export async function adminRejectClaim(claimId: number) {
  const [updated] = await db
    .update(claimRequests)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(claimRequests.id, claimId))
    .returning();

  return updated;
}

// ===== BRAG BOARD PHOTOS (Admin) =====

export async function adminGetBragBoardPhotos() {
  return db
    .select({
      id: bragBoardPhotos.id,
      boatId: bragBoardPhotos.boatId,
      boatName: boats.name,
      boatSlug: boats.slug,
      submitterName: bragBoardPhotos.submitterName,
      submitterEmail: bragBoardPhotos.submitterEmail,
      photoUrl: bragBoardPhotos.photoUrl,
      catchDescription: bragBoardPhotos.catchDescription,
      status: bragBoardPhotos.status,
      submittedAt: bragBoardPhotos.submittedAt,
    })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
    .orderBy(desc(bragBoardPhotos.submittedAt));
}

export async function adminUpdateBragBoardPhoto(
  photoId: number,
  status: "approved" | "rejected"
) {
  const [updated] = await db
    .update(bragBoardPhotos)
    .set({ status })
    .where(eq(bragBoardPhotos.id, photoId))
    .returning();

  return updated;
}

export async function adminGetBragBoardPhotoSpecies(photoIds: number[]) {
  if (photoIds.length === 0) return new Map<number, { id: number; name: string }[]>();

  const rows = await db
    .select({
      photoId: bragBoardPhotoSpecies.photoId,
      speciesId: species.id,
      speciesName: species.name,
    })
    .from(bragBoardPhotoSpecies)
    .innerJoin(species, eq(bragBoardPhotoSpecies.speciesId, species.id))
    .where(inArray(bragBoardPhotoSpecies.photoId, photoIds));

  const map = new Map<number, { id: number; name: string }[]>();
  for (const row of rows) {
    const existing = map.get(row.photoId) || [];
    existing.push({ id: row.speciesId, name: row.speciesName });
    map.set(row.photoId, existing);
  }
  return map;
}

export async function adminUpdateBragBoardPhotoDetails(
  photoId: number,
  data: {
    catchDescription?: string;
    submitterName?: string;
    boatId?: number;
    speciesIds?: number[];
  }
) {
  const { speciesIds, ...photoFields } = data;

  // Update photo fields if any provided
  const hasFields = Object.keys(photoFields).length > 0;
  let updated;
  if (hasFields) {
    const [result] = await db
      .update(bragBoardPhotos)
      .set(photoFields)
      .where(eq(bragBoardPhotos.id, photoId))
      .returning();
    updated = result;
  } else {
    const [result] = await db
      .select()
      .from(bragBoardPhotos)
      .where(eq(bragBoardPhotos.id, photoId));
    updated = result;
  }

  if (!updated) return null;

  // Update species if provided
  if (speciesIds !== undefined) {
    await db
      .delete(bragBoardPhotoSpecies)
      .where(eq(bragBoardPhotoSpecies.photoId, photoId));

    if (speciesIds.length > 0) {
      await db.insert(bragBoardPhotoSpecies).values(
        speciesIds.map((speciesId) => ({ photoId, speciesId }))
      );
    }
  }

  return updated;
}
