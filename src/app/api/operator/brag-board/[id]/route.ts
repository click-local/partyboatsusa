import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { bragBoardPhotos, boats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";
import { buildPhotoApprovedEmail } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

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

  // Send approval email to submitter
  const [photo] = await db
    .select({
      submitterName: bragBoardPhotos.submitterName,
      submitterEmail: bragBoardPhotos.submitterEmail,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
    .from(bragBoardPhotos)
    .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
    .where(eq(bragBoardPhotos.id, photoId));

  if (photo?.submitterEmail) {
    const html = buildPhotoApprovedEmail({
      boatName: photo.boatName,
      boatSlug: photo.boatSlug,
      submitterName: photo.submitterName,
    });
    resend.emails
      .send({
        from: EMAIL_FROM,
        to: [photo.submitterEmail],
        subject: `Your catch photo has been approved!`,
        html,
      })
      .catch(() => {});
  }

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
