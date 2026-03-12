import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { bragBoardPhotos, boats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function verifyPhotoOwnership(operatorId: number, photoId: number) {
  const result = await db
    .select({ id: bragBoardPhotos.id })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
    .where(
      and(eq(bragBoardPhotos.id, photoId), eq(boats.operatorId, operatorId))
    )
    .limit(1);
  return result.length > 0;
}

// Approve photo
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photoId = parseInt(id, 10);
  if (isNaN(photoId)) {
    return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
  }

  const owns = await verifyPhotoOwnership(operator.id, photoId);
  if (!owns) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await db
    .update(bragBoardPhotos)
    .set({ status: "approved" })
    .where(eq(bragBoardPhotos.id, photoId));

  return NextResponse.json({ success: true });
}

// Reject photo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photoId = parseInt(id, 10);
  if (isNaN(photoId)) {
    return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
  }

  const owns = await verifyPhotoOwnership(operator.id, photoId);
  if (!owns) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await db
    .update(bragBoardPhotos)
    .set({ status: "rejected" })
    .where(eq(bragBoardPhotos.id, photoId));

  return NextResponse.json({ success: true });
}
