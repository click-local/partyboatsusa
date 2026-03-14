import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boats, boatTripTypes, boatAmenities, boatSpecies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const boatId = parseInt(id, 10);
  if (isNaN(boatId)) {
    return NextResponse.json({ error: "Invalid boat ID" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(boats)
    .where(and(eq(boats.id, boatId), eq(boats.operatorId, operator.id)))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  // Include join table IDs for form pre-population
  const [ttRows, amRows, spRows] = await Promise.all([
    db.select({ tripTypeId: boatTripTypes.tripTypeId }).from(boatTripTypes).where(eq(boatTripTypes.boatId, boatId)),
    db.select({ amenityId: boatAmenities.amenityId }).from(boatAmenities).where(eq(boatAmenities.boatId, boatId)),
    db.select({ speciesId: boatSpecies.speciesId }).from(boatSpecies).where(eq(boatSpecies.boatId, boatId)),
  ]);

  return NextResponse.json({
    ...result[0],
    tripTypeIds: ttRows.map((r) => r.tripTypeId),
    amenityIds: amRows.map((r) => r.amenityId),
    speciesIds: spRows.map((r) => r.speciesId),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const boatId = parseInt(id, 10);
  if (isNaN(boatId)) {
    return NextResponse.json({ error: "Invalid boat ID" }, { status: 400 });
  }

  // Verify ownership
  const existing = await db
    .select({ id: boats.id })
    .from(boats)
    .where(and(eq(boats.id, boatId), eq(boats.operatorId, operator.id)))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  const body = await request.json();

  // Only allow updating specific fields
  const allowedFields: Record<string, unknown> = {};
  const editableKeys = [
    "name", "operatorName", "descriptionShort", "descriptionLong",
    "cityName", "portName", "streetAddress", "zipCode",
    "latitude", "longitude", "minPricePerPerson", "maxPricePerPerson",
    "capacity", "phone", "email", "websiteUrl",
    "socialX", "socialFacebook", "socialInstagram", "socialYoutube",
    "primaryImageUrl", "imageFocalPointX", "imageFocalPointY",
    "galleryImageUrls", "targetSpecies", "whatsIncluded", "availableExtras",
  ];

  // Pro-only fields: gallery images
  const isPro = operator.tier?.isHighestTier || false;

  for (const key of editableKeys) {
    if (key in body) {
      if (key === "galleryImageUrls" && !isPro) continue;
      allowedFields[key] = body[key];
    }
  }

  // Handle join table fields separately
  const { tripTypeIds, amenityIds, speciesIds } = body;

  if (Object.keys(allowedFields).length === 0 && tripTypeIds === undefined && amenityIds === undefined && speciesIds === undefined) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  let updated;
  if (Object.keys(allowedFields).length > 0) {
    [updated] = await db
      .update(boats)
      .set(allowedFields)
      .where(eq(boats.id, boatId))
      .returning();
  } else {
    [updated] = await db.select().from(boats).where(eq(boats.id, boatId));
  }

  // Update join tables
  if (Array.isArray(tripTypeIds)) {
    await db.delete(boatTripTypes).where(eq(boatTripTypes.boatId, boatId));
    if (tripTypeIds.length) {
      await db.insert(boatTripTypes).values(tripTypeIds.map((tid: number) => ({ boatId, tripTypeId: tid })));
    }
  }
  if (Array.isArray(amenityIds)) {
    await db.delete(boatAmenities).where(eq(boatAmenities.boatId, boatId));
    if (amenityIds.length) {
      await db.insert(boatAmenities).values(amenityIds.map((aid: number) => ({ boatId, amenityId: aid })));
    }
  }
  if (Array.isArray(speciesIds)) {
    await db.delete(boatSpecies).where(eq(boatSpecies.boatId, boatId));
    if (speciesIds.length) {
      await db.insert(boatSpecies).values(speciesIds.map((sid: number) => ({ boatId, speciesId: sid })));
    }
  }

  return NextResponse.json(updated);
}
