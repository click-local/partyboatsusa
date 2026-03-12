import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boats } from "@/lib/db/schema";
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

  return NextResponse.json(result[0]);
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
    "capacity", "phone", "email", "websiteUrl", "bookingUrl",
    "bookingLinkTarget", "bookingButtonText",
    "socialX", "socialFacebook", "socialInstagram", "socialYoutube",
    "primaryImageUrl", "imageFocalPointX", "imageFocalPointY",
    "galleryImageUrls", "targetSpecies", "whatsIncluded", "availableExtras",
  ];

  for (const key of editableKeys) {
    if (key in body) {
      allowedFields[key] = body[key];
    }
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(boats)
    .set(allowedFields)
    .where(eq(boats.id, boatId))
    .returning();

  return NextResponse.json(updated);
}
