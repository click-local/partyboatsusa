import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import {
  adminGetBragBoardPhotos,
  adminUpdateBragBoardPhoto,
  adminGetBragBoardPhotoSpecies,
  adminUpdateBragBoardPhotoDetails,
} from "@/lib/db/queries/admin";
import { Resend } from "resend";
import { buildPhotoApprovedEmail } from "@/lib/email/templates";
import { getBoatNotificationRecipient } from "@/lib/email/send-notification";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function GET() {
  const { error } = await adminGuard();
  if (error) return error;

  const photos = await adminGetBragBoardPhotos();
  const photoIds = photos.map((p) => p.id);
  const speciesMap = await adminGetBragBoardPhotoSpecies(photoIds);

  const photosWithSpecies = photos.map((p) => ({
    ...p,
    species: speciesMap.get(p.id) || [],
  }));

  return NextResponse.json(photosWithSpecies);
}

export async function PUT(request: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;

  const body = await request.json();

  const { adminBragBoardActionSchema } = await import("@/lib/validations");
  const parsed = adminBragBoardActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
  }
  const { photoId, action, boatId, boatName, boatSlug, submitterName } = parsed.data;

  const result = await adminUpdateBragBoardPhoto(photoId, action === "approve" ? "approved" : "rejected");
  if (!result) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Send email to operator/boat email on approval (fire-and-forget)
  if (action === "approve" && boatId) {
    const recipient = await getBoatNotificationRecipient(boatId);
    const to: string[] = [];
    if (recipient.operatorEmail) to.push(recipient.operatorEmail);
    else if (recipient.boatEmail) to.push(recipient.boatEmail);

    if (to.length > 0) {
      const html = buildPhotoApprovedEmail({
        boatName: boatName || "",
        boatSlug: boatSlug || "",
        submitterName: submitterName || "",
      });

      resend.emails
        .send({
          from: EMAIL_FROM,
          to,
          subject: `Brag Board Photo Approved: ${boatName}`,
          html,
        })
        .catch(() => {});
    }
  }

  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;

  const body = await request.json();

  const { adminBragBoardEditSchema } = await import("@/lib/validations");
  const parsed = adminBragBoardEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    );
  }

  const { photoId, ...updates } = parsed.data;
  const result = await adminUpdateBragBoardPhotoDetails(photoId, updates);
  if (!result) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
