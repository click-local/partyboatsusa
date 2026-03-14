import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin-guard";
import {
  adminGetBragBoardPhotos,
  adminUpdateBragBoardPhoto,
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
  return NextResponse.json(photos);
}

export async function PUT(request: NextRequest) {
  const { error } = await adminGuard();
  if (error) return error;

  const body = await request.json();
  const { photoId, action, boatId, boatName, boatSlug, submitterName } = body as {
    photoId: number;
    action: "approve" | "reject";
    boatId: number;
    boatName: string;
    boatSlug: string;
    submitterName: string;
  };

  if (!photoId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

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
        boatName,
        boatSlug,
        submitterName,
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
